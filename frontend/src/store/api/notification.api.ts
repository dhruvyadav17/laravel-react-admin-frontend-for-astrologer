/**
 * Notification API -- RTK Query endpoints
 *
 * Reads Laravel database notifications (notifiable_type = User).
 * Notifications are created server-side in:
 *   - NewConsultationRequest -- fires to astrologer on booking
 *   - ConsultationAccepted / Rejected -- fires to user
 *   - ConsultationCompleted -- fires to user on session end
 *
 * TO ADD A NEW NOTIFICATION TYPE:
 * 1. Create app/Notifications/YourNotification.php.
 * 2. Call $user->notify(new YourNotification($data)) in the service.
 * 3. Add the type string to the frontend NotificationBell render logic
 *    to display a custom icon/message for the new type.
 */
import { baseApi } from './baseApi';

export interface AppNotification {
  id:         string;
  data: {
    type:            string;
    title:           string;
    message:         string;
    consultation_id?: number;
    url?:            string;
    icon?:           string;
    color?:          string;
  };
  read_at:    string | null;
  created_at: string;
}

export interface NotificationResponse {
  notifications: AppNotification[];
  unread_count:  number;
}

const notificationApi = baseApi.injectEndpoints({
  endpoints: (build) => ({

    getNotifications: build.query<NotificationResponse, void>({
      query: () => '/notifications',
      transformResponse: (res: any): NotificationResponse => res.data ?? {
        notifications: [], unread_count: 0,
      },
      providesTags: ['Notification' as any],
    }),

    markAllRead: build.mutation<void, void>({
      query: () => ({ url: '/notifications/read', method: 'PATCH' }),
      invalidatesTags: ['Notification' as any],
    }),

    markOneRead: build.mutation<void, string>({
      query: (id) => ({ url: `/notifications/${id}`, method: 'PATCH' }),
      invalidatesTags: ['Notification' as any],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useMarkAllReadMutation,
  useMarkOneReadMutation,
} = notificationApi;
