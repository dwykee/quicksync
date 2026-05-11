import { useState, useCallback, useRef, useEffect } from 'react';
import { db } from '../firebase';
import { collection, doc, setDoc, onSnapshot, addDoc, deleteDoc, getDocs } from 'firebase/firestore';
import type { TransferItem } from '../components/TransferCard';

interface UseWebRTCReturn {
  connected: boolean;
  peerId: string;
  remotePeerId: string;
  setRemotePeerId: (id: string) => void;
  connectToPeer: (targetId?: string) => void;
  sendMessage: (text: string) => void;
  sendFile: (file: File) => void;
  receivedItems: TransferItem[];
}

export const useWebRTC = (userId?: string): UseWebRTCReturn => {
  const [connected, setConnected] = useState(false);
  const [peerId, setPeerId] = useState<string>('');
  const [remotePeerId, setRemotePeerId] = useState<string>('');
  const [receivedItems, setReceivedItems] = useState<TransferItem[]>([]);

  const dataChannel = useRef<RTCDataChannel | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const pendingFileMeta = useRef<{ name: string; ext: string; size: number } | null>(null);
  const fileChunks = useRef<ArrayBuffer[]>([]);
  const lastOfferSdp = useRef<string | null>(null);
  // Track if WE initiated the current active connection (as caller)
  const isCallerRef = useRef(false);

  const makePC = () =>
    new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
      ],
    });

  // Shared handler: wire up a data channel (works for both caller & callee channels)
  const wireChannel = useCallback((ch: RTCDataChannel) => {
    ch.binaryType = 'arraybuffer';

    ch.onopen = () => {
      console.log('[QS] channel open');
      dataChannel.current = ch;
      setConnected(true);
    };
    ch.onclose = () => {
      console.log('[QS] channel closed');
      // Only mark disconnected if this is still the active channel
      if (dataChannel.current === ch) {
        setConnected(false);
      }
    };
    ch.onmessage = (event) => {
      if (typeof event.data === 'string') {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'text') {
            setReceivedItems((p) => [
              {
                id: Math.random().toString(36).substring(2, 9),
                type: 'text',
                content: msg.content,
                timestamp: Date.now(),
                sender: 'peer',
              },
              ...p,
            ]);
          } else if (msg.type === 'file-meta') {
            // Start of a new chunked file transfer
            pendingFileMeta.current = { name: msg.name, ext: msg.name.split('.').pop() || '', size: msg.size };
            fileChunks.current = [];
          } else if (msg.type === 'file-end') {
            // All chunks received — reassemble
            const blob = new Blob(fileChunks.current);
            const url = URL.createObjectURL(blob);
            const m = pendingFileMeta.current;
            setReceivedItems((p) => [
              {
                id: Math.random().toString(36).substring(2, 9),
                type: 'file',
                content: m?.name || 'Received_File',
                fileExtension: m?.ext || 'unknown',
                url,
                blob,
                timestamp: Date.now(),
                sender: 'peer',
              },
              ...p,
            ]);
            pendingFileMeta.current = null;
            fileChunks.current = [];
          }
        } catch {
          setReceivedItems((p) => [
            { id: Math.random().toString(36).substring(2, 9), type: 'text', content: event.data, timestamp: Date.now(), sender: 'peer' },
            ...p,
          ]);
        }
      } else if (event.data instanceof ArrayBuffer || event.data instanceof Blob) {
        // This is a file chunk — buffer it
        if (event.data instanceof Blob) {
          event.data.arrayBuffer().then((buf) => fileChunks.current.push(buf));
        } else {
          fileChunks.current.push(event.data);
        }
      }
    };
  }, []);

  // Derive peerId from userId
  useEffect(() => {
    setPeerId(userId ? userId.substring(0, 10) : Math.random().toString(36).substring(2, 9));
  }, [userId]);

  // ── CALLEE ─────────────────────────────────────────────────
  // Listen on our own room for incoming offers
  useEffect(() => {
    if (!peerId) return;

    const roomRef = doc(db, 'rooms', peerId);

    // Clear any stale offer/answer so we start fresh
    setDoc(roomRef, { created: Date.now(), offer: null, answer: null }, { merge: true });

    let pendingIce: RTCIceCandidateInit[] = [];
    let rdReady = false;
    let calleePC: RTCPeerConnection | null = null;

    const unsubRoom = onSnapshot(roomRef, async (snap) => {
      const d = snap.data();
      if (!d?.offer) return;

      // Deduplicate: skip if we already handled this exact SDP
      if (d.offer.sdp === lastOfferSdp.current) return;
      lastOfferSdp.current = d.offer.sdp;

      // Don't process offers that WE sent (when we are the caller connecting to someone else
      // the room we write to is the TARGET's room, not our own, so this shouldn't happen,
      // but guard anyway)
      if (isCallerRef.current) return;

      console.log('[QS] callee: new offer');

      // Tear down old callee PC
      if (calleePC) calleePC.close();
      rdReady = false;
      pendingIce = [];

      const pc = makePC();
      calleePC = pc;
      pcRef.current = pc;

      pc.oniceconnectionstatechange = () => {
        if (pc.iceConnectionState === 'connected') setConnected(true);
        else if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed') {
          if (pcRef.current === pc) setConnected(false);
        }
      };

      pc.ondatachannel = (ev) => {
        console.log('[QS] callee: ondatachannel fired');
        wireChannel(ev.channel);
      };

      pc.onicecandidate = (ev) => {
        if (ev.candidate) {
          addDoc(collection(db, 'rooms', peerId, 'calleeCandidates'), ev.candidate.toJSON());
        }
      };

      await pc.setRemoteDescription(new RTCSessionDescription(d.offer));
      rdReady = true;

      // Flush buffered ICE
      for (const c of pendingIce) pc.addIceCandidate(new RTCIceCandidate(c)).catch(() => { });
      pendingIce = [];

      const ans = await pc.createAnswer();
      await pc.setLocalDescription(ans);
      await setDoc(roomRef, { answer: { type: ans.type, sdp: ans.sdp } }, { merge: true });
    });

    const unsubIce = onSnapshot(collection(db, 'rooms', peerId, 'callerCandidates'), (snap) => {
      snap.docChanges().forEach((ch) => {
        if (ch.type === 'added') {
          const cand = ch.doc.data();
          if (calleePC && rdReady) {
            calleePC.addIceCandidate(new RTCIceCandidate(cand)).catch(() => { });
          } else {
            pendingIce.push(cand as RTCIceCandidateInit);
          }
        }
      });
    });

    return () => {
      if (calleePC) calleePC.close();
      unsubRoom();
      unsubIce();
    };
  }, [peerId, wireChannel]);

  // ── CALLER ─────────────────────────────────────────────────
  const connectToPeer = useCallback(
    async (targetId?: string) => {
      const target = targetId || remotePeerId;
      if (!target) return;
      if (targetId) setRemotePeerId(targetId);

      isCallerRef.current = true;

      // Close previous caller connection only
      if (pcRef.current && isCallerRef.current) {
        pcRef.current.close();
      }

      const pc = makePC();
      pcRef.current = pc;

      pc.oniceconnectionstatechange = () => {
        if (pc.iceConnectionState === 'connected') setConnected(true);
        else if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed') {
          if (pcRef.current === pc) setConnected(false);
        }
      };

      const ch = pc.createDataChannel('quicksync');
      wireChannel(ch);

      const targetRoom = doc(db, 'rooms', target);

      // Clean up old candidates from previous sessions
      const cleanSub = async (subName: string) => {
        const ref = collection(db, 'rooms', target, subName);
        const existing = await getDocs(ref);
        existing.forEach((d) => deleteDoc(d.ref));
      };
      await cleanSub('callerCandidates');
      await cleanSub('calleeCandidates');

      pc.onicecandidate = (ev) => {
        if (ev.candidate) {
          addDoc(collection(db, 'rooms', target, 'callerCandidates'), ev.candidate.toJSON());
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Write offer and clear old answer
      await setDoc(targetRoom, { offer: { type: offer.type, sdp: offer.sdp }, answer: null }, { merge: true });

      // Listen for answer
      const unsubAns = onSnapshot(targetRoom, (snap) => {
        const d = snap.data();
        if (!pc.currentRemoteDescription && d?.answer) {
          pc.setRemoteDescription(new RTCSessionDescription(d.answer));
        }
      });

      // Listen for callee ICE candidates
      const unsubCalleeIce = onSnapshot(collection(db, 'rooms', target, 'calleeCandidates'), (snap) => {
        snap.docChanges().forEach((change) => {
          if (change.type === 'added') {
            pc.addIceCandidate(new RTCIceCandidate(change.doc.data())).catch(() => { });
          }
        });
      });
    },
    [remotePeerId, wireChannel]
  );

  // ── SEND ───────────────────────────────────────────────────
  const sendMessage = useCallback((text: string) => {
    if (dataChannel.current?.readyState === 'open') {
      dataChannel.current.send(JSON.stringify({ type: 'text', content: text }));
      setReceivedItems((p) => [
        { id: Math.random().toString(36).substring(2, 9), type: 'text', content: text, timestamp: Date.now(), sender: 'me' },
        ...p,
      ]);
    }
  }, []);

  const CHUNK_SIZE = 16384; // 16KB per chunk

  const sendFile = useCallback((file: File) => {
    const ch = dataChannel.current;
    if (ch?.readyState === 'open') {
      // Send file metadata first
      ch.send(JSON.stringify({ type: 'file-meta', name: file.name, size: file.size, typeStr: file.type }));

      // Read and send file in chunks
      file.arrayBuffer().then((buffer) => {
        const totalChunks = Math.ceil(buffer.byteLength / CHUNK_SIZE);
        let offset = 0;

        const sendNextChunk = () => {
          if (offset >= buffer.byteLength) {
            // All chunks sent — notify receiver
            ch.send(JSON.stringify({ type: 'file-end', name: file.name, totalChunks }));
            return;
          }
          const end = Math.min(offset + CHUNK_SIZE, buffer.byteLength);
          const chunk = buffer.slice(offset, end);
          ch.send(chunk);
          offset = end;
          // Use setTimeout to avoid overwhelming the data channel buffer
          setTimeout(sendNextChunk, 0);
        };

        sendNextChunk();
      });
    }

    // Add to local items immediately for UX
    const ext = file.name.split('.').pop() || '';
    const url = URL.createObjectURL(file);
    setReceivedItems((p) => [
      { id: Math.random().toString(36).substring(2, 9), type: 'file', content: file.name, fileExtension: ext, url, blob: file, timestamp: Date.now(), sender: 'me' },      ...p,
    ]);
  }, []);

  return { connected, peerId, remotePeerId, setRemotePeerId, connectToPeer, sendMessage, sendFile, receivedItems };
};
