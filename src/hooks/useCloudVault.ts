import { useState, useEffect, useCallback } from 'react';
import { db, storage } from '../firebase';
import { collection, addDoc, query, where, orderBy, onSnapshot, doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import type { TransferItem } from '../components/TransferCard';

const BASIC_STORAGE_LIMIT = 100 * 1024 * 1024; // 100 MB

export interface CloudVaultItem {
  id: string;
  type: 'text' | 'file';
  content: string;
  fileExtension?: string;
  url?: string;
  timestamp: number;
  sender: 'me' | 'peer';
  fileSize?: number;
  storagePath?: string;
}

export const useCloudVault = (userId?: string) => {
  const [historyItems, setHistoryItems] = useState<CloudVaultItem[]>([]);
  const [storageUsed, setStorageUsed] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const storageLimit = BASIC_STORAGE_LIMIT;

  // Load transfer history from Firestore (real-time)
  useEffect(() => {
    if (!userId) return;

    const q = query(
      collection(db, 'users', userId, 'transferHistory'),
      orderBy('timestamp', 'desc')
    );

    const unsub = onSnapshot(q, (snap) => {
      const items: CloudVaultItem[] = [];
      snap.forEach((d) => {
        items.push({ id: d.id, ...d.data() } as CloudVaultItem);
      });
      setHistoryItems(items);
    });

    return () => unsub();
  }, [userId]);

  // Load storage usage
  useEffect(() => {
    if (!userId) return;
    const loadUsage = async () => {
      const userRef = doc(db, 'users', userId);
      const snap = await getDoc(userRef);
      if (snap.exists() && snap.data().storageUsed) {
        setStorageUsed(snap.data().storageUsed);
      }
    };
    loadUsage();
  }, [userId]);

  // Save a text message to history
  const saveTextToHistory = useCallback(async (text: string, sender: 'me' | 'peer') => {
    if (!userId) return;

    await addDoc(collection(db, 'users', userId, 'transferHistory'), {
      type: 'text',
      content: text,
      timestamp: Date.now(),
      sender,
    });
  }, [userId]);

  // Save a file to Cloud Vault (Firebase Storage + Firestore metadata)
  const saveFileToVault = useCallback(async (
    file: File | Blob,
    fileName: string,
    sender: 'me' | 'peer'
  ): Promise<boolean> => {
    if (!userId) return false;

    const fileSize = file.size;

    // Check storage limit
    if (storageUsed + fileSize > storageLimit) {
      console.warn('[CloudVault] Storage limit reached');
      return false;
    }

    setIsUploading(true);
    console.log('[CloudVault] Starting upload for:', fileName, 'Size:', fileSize);

    try {
      // Upload to Firebase Storage with proper metadata to fix download naming
      const filePath = `vault/${userId}/${Date.now()}_${fileName}`;
      const storageRef = ref(storage, filePath);

      const metadata = {
        contentType: file.type || 'application/octet-stream',
        contentDisposition: `attachment; filename="${fileName}"`
      };

      await uploadBytes(storageRef, file, metadata);
      const downloadURL = await getDownloadURL(storageRef);

      const ext = fileName.split('.').pop() || '';

      // Save metadata to Firestore
      await addDoc(collection(db, 'users', userId, 'transferHistory'), {
        type: 'file',
        content: fileName,
        fileExtension: ext,
        url: downloadURL,
        timestamp: Date.now(),
        sender,
        fileSize,
        storagePath: filePath,
      });

      // Update storage usage
      const newUsage = storageUsed + fileSize;
      setStorageUsed(newUsage);
      await setDoc(doc(db, 'users', userId), { storageUsed: newUsage }, { merge: true });

      console.log('[CloudVault] Upload success for:', fileName);
      return true;
    } catch (err) {
      console.error('[CloudVault] Upload failed:', err);
      return false;
    } finally {
      setIsUploading(false);
    }
  }, [userId, storageUsed, storageLimit]);

  // Delete from history (and Storage if applicable)
  const deleteFromHistory = useCallback(async (item: CloudVaultItem) => {
    if (!userId) return;

    try {
      // 1. Delete from Firebase Storage if it's a file with a path
      if (item.type === 'file' && item.storagePath) {
        const storageRef = ref(storage, item.storagePath);
        await deleteObject(storageRef).catch((e) => console.warn('Storage delete failed:', e));

        // Update storage usage
        if (item.fileSize) {
          const newUsage = Math.max(0, storageUsed - item.fileSize);
          setStorageUsed(newUsage);
          await setDoc(doc(db, 'users', userId), { storageUsed: newUsage }, { merge: true });
        }
      }

      // 2. Delete Firestore document
      await deleteDoc(doc(db, 'users', userId, 'transferHistory', item.id));
    } catch (err) {
      console.error('[CloudVault] Delete failed:', err);
    }
  }, [userId, storageUsed]);

  return {
    historyItems,
    storageUsed,
    storageLimit,
    saveTextToHistory,
    saveFileToVault,
    deleteFromHistory,
    isUploading,
  };
};
