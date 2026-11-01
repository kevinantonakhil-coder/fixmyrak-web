import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { reportService } from '../services/reportService';
import { Star, MessageSquare, CheckCircle, Send, Heart } from 'lucide-react';

export const FeedbackPage: React.FC = () => {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [category, setCategory] = useState('General Suggestion');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || message.trim().length < 3) {
      alert('Please enter a brief message.');
      return;
    }

    setIsSubmitting(true);
    try {
      await reportService.submitFeedback({
        userId: user?.uid,
        userName: user?.displayName || user?.email?.split('@')[0] || 'Community Resident',
        rating,
        category,
        message: message.trim(),
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Feedback submission error:', err);
      alert('Failed to submit feedback.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 space-y-8 animate-in fade-in bg-[#f6f7f3]">
      <div className="text-center space-y-2">
        <span className="text-[10px] font-bold text-[#819087] uppercase tracking-widest block">
          Citizen Voice
        </span>
        <h1 className="text-3xl font-extrabold text-[#143d35] font-manrope tracking-tight">
          Help Us Improve FixMyRAK
        </h1>
        <p className="text-xs sm:text-sm text-[#74817b]">
          Your feedback directly guides new civic enhancements, mobile experience improvements, and platform features.
        </p>
      </div>

      {submitted ? (
        <div className="bg-white p-8 rounded-2xl border border-[#e4e9e1] text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 bg-[#e8f1e9] text-[#143d35] rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-extrabold text-[#143d35] font-manrope">Thank You for Your Feedback!</h2>
          <p className="text-xs text-[#74817b] max-w-sm mx-auto leading-relaxed">
            Your evaluation and notes have been logged to the coordinator feedback board. Thank you for making Ras Al Khaimah even better!
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setMessage('');
              setRating(5);
            }}
            className="px-5 py-2.5 bg-[#f6f7f3] hover:bg-[#e8f1e9] text-[#143d35] font-bold text-xs rounded-xl border border-[#e4e9e1] transition-colors cursor-pointer"
          >
            Submit Another Note
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 sm:p-8 rounded-2xl border border-[#e4e9e1] shadow-xs space-y-6"
        >
          {/* Star Rating */}
          <div>
            <label className="block text-xs font-bold text-[#143d35] font-manrope uppercase tracking-wider mb-2">
              Overall Experience Rating
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  className="p-1 hover:scale-115 transition-transform cursor-pointer"
                >
                  <Star
                    className={`w-7 h-7 ${
                      (hoverRating !== null ? star <= hoverRating : star <= rating)
                        ? 'fill-[#e97950] text-[#e97950]'
                        : 'text-slate-200'
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-bold text-[#74817b] ml-2">
                {rating} of 5 Stars
              </span>
            </div>
          </div>

          {/* Feedback Category */}
          <div>
            <label className="block text-xs font-bold text-[#143d35] font-manrope uppercase tracking-wider mb-2">
              Feedback Topic
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2.5 text-xs border border-[#e4e9e1] rounded-xl focus:ring-2 focus:ring-[#143d35] focus:outline-hidden bg-[#f6f7f3] font-medium text-[#1c302c]"
            >
              <option value="General Suggestion">General Suggestion</option>
              <option value="Feature Request">Feature Request</option>
              <option value="Bug or Issue Encountered">Bug or Issue Encountered</option>
              <option value="Map & Geolocation Usability">Map & Geolocation Usability</option>
              <option value="AI Assistant Feedback">AI Assistant Feedback</option>
            </select>
          </div>

          {/* Message */}
          <div>
            <label className="block text-xs font-bold text-[#143d35] font-manrope uppercase tracking-wider mb-2">
              Your Suggestions & Experience Notes
            </label>
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us what worked well or what we can improve to make reporting infrastructure in Ras Al Khaimah easier..."
              className="w-full p-3 text-xs sm:text-sm border border-[#e4e9e1] rounded-xl focus:ring-2 focus:ring-[#143d35] focus:outline-hidden bg-[#f6f7f3]/50 text-[#1c302c]"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 rounded-xl text-xs font-bold text-white bg-[#143d35] hover:bg-[#205347] active:scale-98 shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Send className="w-4 h-4 text-[#d7edbd]" />
            <span>{isSubmitting ? 'Submitting...' : 'Submit Citizen Feedback'}</span>
          </button>
        </form>
      )}
    </div>
  );
};
