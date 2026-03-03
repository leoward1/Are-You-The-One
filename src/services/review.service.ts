import { supabase } from './supabase.service';
import { Review, ApiResponse } from '../types';

class ReviewService {
    async submitReview(reviewData: Omit<Review, 'id' | 'created_at' | 'approved'>): Promise<ApiResponse<Review>> {
        try {
            const { data, error } = await supabase
                .from('reviews')
                .insert([
                    {
                        ...reviewData,
                        approved: false // Reviews require moderation by default as per PRD
                    }
                ])
                .select()
                .single();

            if (error) throw error;

            return {
                data: data as Review,
                success: true,
                message: 'Review submitted successfully and is pending approval.'
            };
        } catch (error: any) {
            console.error('Error submitting review:', error);
            return {
                data: null as any,
                success: false,
                message: error.message || 'Failed to submit review'
            };
        }
    }

    async getReviewsForMatch(matchId: string): Promise<ApiResponse<Review[]>> {
        try {
            const { data, error } = await supabase
                .from('reviews')
                .select('*')
                .eq('about_match_id', matchId)
                .eq('approved', true);

            if (error) throw error;

            return {
                data: data as Review[],
                success: true
            };
        } catch (error: any) {
            console.error('Error fetching reviews:', error);
            return {
                data: [],
                success: false,
                message: error.message || 'Failed to fetch reviews'
            };
        }
    }

    async getPublicReviews(): Promise<ApiResponse<Review[]>> {
        try {
            const { data, error } = await supabase
                .from('reviews')
                .select(`
          *,
          profiles:from_user_id (first_name, primary_photo)
        `)
                .eq('approved', true)
                .order('created_at', { ascending: false })
                .limit(10);

            if (error) throw error;

            return {
                data: data as any,
                success: true
            };
        } catch (error: any) {
            console.error('Error fetching public reviews:', error);
            return {
                data: [],
                success: false,
                message: error.message || 'Failed to fetch public reviews'
            };
        }
    }
}

export const reviewService = new ReviewService();
