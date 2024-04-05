import { inject, TestBed } from '@angular/core/testing';
import { EventsService } from './events.service';

describe('EventsService', () => {
	beforeEach(() =>
		TestBed.configureTestingModule({
			declarations: [],
			providers: [EventsService],
			imports: [],
		}),
	);

	it('should allow posting events when no subscribers are setup', inject(
		[EventsService],
		(eventsService: EventsService) => {
			eventsService.profileEmailsChanged.next([]);
		},
	));

	it('should correctly deliver events', inject(
		[EventsService],
		(eventsService: EventsService) =>
			new Promise((resolve, reject) => {
				eventsService.profileEmailsChanged.subscribe((e) => {
					resolve(true);
				});
				eventsService.profileEmailsChanged.next(['123']);
			}),
	));
});
