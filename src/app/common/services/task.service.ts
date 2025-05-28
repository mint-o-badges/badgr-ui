import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseHttpApiService } from './base-http-api.service';
import { SessionService } from './session.service';
import { AppConfigService } from '../app-config.service';
import { MessageService } from './message.service';
import { TaskPollingManagerService, TaskResult } from '../task-manager.service';

@Injectable({
	providedIn: 'root',
})
export class TaskStatusService extends BaseHttpApiService {
	constructor(
		protected loginService: SessionService,
		protected http: HttpClient,
		protected configService: AppConfigService,
		protected messageService: MessageService,
		private taskPollingManager: TaskPollingManagerService,
	) {
		super(loginService, http, configService, messageService);
	}

	/**
	 * Start a new batch task and begin polling
	 */
	startBatchTask(taskId: string, issuerSlug: string, badgeSlug: string): Observable<TaskResult> {
		return this.taskPollingManager.startTaskPolling(taskId, issuerSlug, badgeSlug);
	}

	/**
	 * Get the active task observable for a badge (if any)
	 */
	getActiveTaskObservable(badgeSlug: string): Observable<TaskResult> | null {
		return this.taskPollingManager.getTaskObservable(badgeSlug);
	}

	getTaskUpdatesForBadge(badgeSlug: string): Observable<TaskResult> {
		return this.taskPollingManager.getTaskUpdatesForBadge(badgeSlug);
	}

	getLastTaskStatus(badgeSlug: string): TaskResult | null {
		return this.taskPollingManager.getLastTaskStatus(badgeSlug);
	}

	hasActiveTask(badgeSlug: string): boolean {
		return this.taskPollingManager.hasActiveTask(badgeSlug);
	}

	stopTaskPolling(badgeSlug: string): void {
		this.taskPollingManager.stopTaskPolling(badgeSlug);
	}
}
