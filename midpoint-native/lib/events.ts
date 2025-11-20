import { supabase, Event, EventInvitation, PollVote } from './supabase'

export class EventsService {
  /**
   * Create a new event and invite users
   */
  static async createEvent(
    title: string,
    location: string,
    createdBy: string,
    invitedUserIds: string[]
  ): Promise<{ data: Event | null; error: any }> {
    try {
      // Create the event
      const { data: event, error: eventError } = await supabase
        .from('events')
        .insert({
          title,
          location,
          created_by: createdBy,
        })
        .select()
        .single()

      if (eventError) throw eventError
      if (!event) {
        return { data: null, error: { message: 'Failed to create event' } }
      }

      // Create invitations for all invited users (including creator if they're in the list)
      const invitations = invitedUserIds.map((userId) => ({
        event_id: event.id,
        user_id: userId,
        status: 'pending' as const,
      }))

      const { error: inviteError } = await supabase
        .from('event_invitations')
        .insert(invitations)

      if (inviteError) {
        console.error('Error creating invitations:', inviteError)
        // Event was created but invitations failed - still return success
        // but log the error
      }

      return { data: event, error: null }
    } catch (error: any) {
      return { data: null, error: { message: error.message || 'Failed to create event' } }
    }
  }

  /**
   * Record a vote on a time poll option
   */
  static async recordVote(
    eventId: string,
    userId: string,
    timeOption: string
  ): Promise<{ data: PollVote | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('poll_votes')
        .insert({
          event_id: eventId,
          user_id: userId,
          time_option: timeOption,
        })
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error: any) {
      // If it's a unique constraint violation, the user already voted - that's okay
      if (error.code === '23505') {
        return { data: null, error: { message: 'Already voted on this time option' } }
      }
      return { data: null, error: { message: error.message || 'Failed to record vote' } }
    }
  }

  /**
   * Remove a vote (toggle off)
   */
  static async removeVote(
    eventId: string,
    userId: string,
    timeOption: string
  ): Promise<{ data: null; error: any }> {
    try {
      const { error } = await supabase
        .from('poll_votes')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .eq('time_option', timeOption)

      if (error) throw error
      return { data: null, error: null }
    } catch (error: any) {
      return { data: null, error: { message: error.message || 'Failed to remove vote' } }
    }
  }

  /**
   * Get event with all details (invitations and votes)
   */
  static async getEventWithDetails(
    eventId: string
  ): Promise<{ data: any | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          invitations:event_invitations(
            *,
            user:users(id, username, first_name, last_name, email)
          ),
          votes:poll_votes(
            *,
            user:users(id, username, first_name, last_name)
          )
        `)
        .eq('id', eventId)
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error: any) {
      return { data: null, error: { message: error.message || 'Failed to get event' } }
    }
  }

  /**
   * Get all events for a user (created by or invited to)
   */
  static async getUserEvents(userId: string): Promise<{ data: Event[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .or(`created_by.eq.${userId},id.in.(SELECT event_id FROM event_invitations WHERE user_id.eq.${userId})`)
        .order('created_at', { ascending: false })

      if (error) throw error
      return { data, error: null }
    } catch (error: any) {
      return { data: null, error: { message: error.message || 'Failed to get events' } }
    }
  }
}

