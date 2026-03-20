import { supabase } from '../config/supabase';
import { DateSuggestion, PaginatedResponse, DateCategory } from '../types';

class DateService {
    async getSuggestions(
        city: string,
        category: DateCategory = 'all',
        limit: number = 20,
        offset: number = 0
    ): Promise<PaginatedResponse<DateSuggestion>> {
        let query = supabase
            .from('date_suggestions')
            .select('*', { count: 'exact' });

        if (city) {
            query = query.ilike('city', city);
        }

        if (category !== 'all') {
            query = query.eq('category', category);
        }

        const { data, error, count } = await query
            .range(offset, offset + limit - 1)
            .order('safety_rating', { ascending: false });

        if (error) throw new Error(error.message);

        return {
            data: data as DateSuggestion[],
            total: count || 0,
            limit,
            offset,
            has_more: (data || []).length === limit,
        };
    }

    async getSuggestionById(id: string): Promise<DateSuggestion> {
        const { data, error } = await supabase
            .from('date_suggestions')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw new Error(error.message);
        return data as DateSuggestion;
    }
}

export const dateService = new DateService();
