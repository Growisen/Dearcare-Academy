import React from 'react';
import { Star, Calendar, MessageCircle } from 'lucide-react';

interface ApprovedContentProps {
  nurse: {
    _id: string;
    hiringDate?: string;
    rating?: number;  
    reviews?: { id: string; text: string; date: string; rating: number; reviewer: string; }[];
  };
}

export function ApprovedContent({ nurse }: ApprovedContentProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not available';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderStars = (rating?: number) => {
    if (!rating) return null;
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-2 text-xs font-medium text-gray-700">
          {rating.toFixed(1)}
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Rating Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-4 h-4 text-yellow-400" />
            <h3 className="text-base font-semibold text-gray-800">Overall Rating</h3>
          </div>
          <div className="space-y-2">
            {nurse.rating ? (
              <>
                {renderStars(nurse.rating)}
                <p className="text-xs text-gray-500 mt-2">
                  Based on {nurse.reviews?.length || 0} verified reviews
                </p>
              </>
            ) : (
              <p className="text-xs text-gray-500">No ratings yet</p>
            )}
          </div>
        </div>

        {/* Hiring Date Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-blue-500" />
            <h3 className="text-base font-semibold text-gray-800">Hired on</h3>
          </div>
          <p className="text-sm text-gray-700">{formatDate(nurse.hiringDate)}</p>
          <p className="text-xs text-gray-500 mt-2">
            {nurse.hiringDate ? 
              `Member for ${Math.floor((new Date().getTime() - new Date(nurse.hiringDate).getTime()) / (1000 * 60 * 60 * 24 * 365))} years` :
              'Hiring date not available'
            }
          </p>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-green-500" />
            <h3 className="text-base font-semibold text-gray-800">Client Reviews</h3>
          </div>
          <span className="text-xs text-gray-500">
            {nurse.reviews?.length || 0} reviews
          </span>
        </div>
        
        {nurse.reviews && nurse.reviews.length > 0 ? (
          <div className="space-y-6">
            {nurse.reviews.map((review, index) => (
              <div 
                key={review.id}
                className="p-5 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors duration-200"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-xs font-medium text-blue-600">
                        {review.reviewer.split(' ')[0][0]}{review.reviewer.split(' ')[1][0]}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900">{review.reviewer}</span>
                      <span className="text-xs text-gray-500">{formatDate(review.date)}</span>
                    </div>
                    <div className="flex items-center">
                      {renderStars(review.rating)}
                    </div>
                    <p className="text-xs text-gray-700 leading-relaxed mt-2">{review.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <MessageCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No reviews yet</p>
          </div>
        )}
      </div>
    </div>
  );
}