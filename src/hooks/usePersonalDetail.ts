import { useQuery } from '@tanstack/react-query';
import { getPersonalDetail } from '@/services/personalDetail';

export const usePersonalDetail = (id: string) => {
    return useQuery({
        queryKey: ['personalDetail', id],
        queryFn: () => getPersonalDetail(id),
    });
};
