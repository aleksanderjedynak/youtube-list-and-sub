import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import type { Channel } from '@/types/youtube';

type Lists = {
  [key: string]: Channel[];
};

const useChannelLists = () => {
  const [lists, setLists] = useState<Lists>(() => {
    const savedLists = localStorage.getItem('lists');
    return savedLists ? JSON.parse(savedLists) : {};
  });

  useEffect(() => {
    if (Object.keys(lists).length > 0) {
      localStorage.setItem('lists', JSON.stringify(lists));
    } else {
      localStorage.removeItem('lists');
    }
  }, [lists]);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'lists') {
        const updatedLists = localStorage.getItem('lists');
        setLists(updatedLists ? JSON.parse(updatedLists) : {});
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const createList = (listName: string): void => {
    if (!listName || listName.length < 3) {
      toast.error('Nazwa listy musi mieć co najmniej 3 znaki.');
      return;
    }
    setLists((prevLists) => {
      if (prevLists[listName]) {
        toast.error(`Lista "${listName}" już istnieje.`);
        return prevLists;
      }
      toast.success(`Lista "${listName}" została utworzona!`);
      return { ...prevLists, [listName]: [] };
    });
  };

  const deleteList = (listName: string): void => {
    setLists((prevLists) => {
      const updatedLists = { ...prevLists };
      delete updatedLists[listName];
      toast.success(`Lista "${listName}" została usunięta.`);
      return updatedLists;
    });
  };

  const toggleChannelInList = (listName: string, channel: Channel): void => {
    setLists((prevLists) => {
      const list = prevLists[listName] || [];
      const updatedList = list.some((c) => c.id === channel.id)
        ? list.filter((c) => c.id !== channel.id)
        : [...list, channel];
      return { ...prevLists, [listName]: updatedList };
    });
  };

  const getListCount = (): number => Object.keys(lists).length;

  const getChannelCountInList = (listName: string): number => {
    return lists[listName]?.length || 0;
  };

  return {
    lists,
    createList,
    deleteList,
    toggleChannelInList,
    getListCount,
    getChannelCountInList,
  };
};

export default useChannelLists;
