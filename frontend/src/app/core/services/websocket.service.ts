import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { Store } from '@ngrx/store';
import { selectAuthToken } from '../store/auth.selectors';
import { filter, take } from 'rxjs/operators';
import { addLiveMatch } from '../store/matches.actions';
import { GroupMatch } from '../models/match.model';

@Injectable({ providedIn: 'root' })
export class WebSocketService {
  private socket: Socket | null = null;
  private wsUrl = environment.wsUrl || (typeof window !== 'undefined' ? window.location.origin : '');

  constructor(private store: Store) {}

  connect(token: string): void {
    if (this.socket?.connected) return;
    this.socket = io(this.wsUrl, {
      path: '/ws',
      auth: { token },
      // WebSocket only: HTTP long-polling needs sticky sessions, which serverless hosting lacks.
      transports: ['websocket'],
    });
    this.socket.on('group_match', (data: { groupId: string; match: GroupMatch }) => {
      this.store.dispatch(addLiveMatch({ groupId: data.groupId, match: data.match }));
    });
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }

  joinGroup(groupId: string): void {
    this.socket?.emit('join_group', { groupId });
  }

  leaveGroup(groupId: string): void {
    this.socket?.emit('leave_group', { groupId });
  }

  connectIfToken(): void {
    this.store
      .select(selectAuthToken)
      .pipe(
        filter((t): t is string => !!t),
        take(1),
      )
      .subscribe((token) => this.connect(token));
  }
}
