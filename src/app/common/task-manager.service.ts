import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timer, BehaviorSubject, EMPTY } from 'rxjs';
import { switchMap, takeWhile, catchError, shareReplay, finalize, tap } from 'rxjs/operators';
import { BaseHttpApiService } from './services/base-http-api.service';
import { SessionService } from './services/session.service';
import { AppConfigService } from './app-config.service';
import { MessageService } from './services/message.service';

export enum TaskStatus {
	PENDING = 'PENDING',
	STARTED = 'STARTED',
	SUCCESS = 'SUCCESS',
	FAILURE = 'FAILURE',
	RETRY = 'RETRY',
	REVOKED = 'REVOKED',
}

export interface TaskResult {
	task_id: string;
	status: TaskStatus;
	result: any;
}

export interface BadgeTaskInfo {
	taskId: string;
	issuerSlug: string;
	badgeSlug: string;
	observable: Observable<TaskResult>;
	lastStatus: TaskResult | null;
}

@Injectable({
	providedIn: 'root',
})
export class TaskPollingManagerService extends BaseHttpApiService {
	protected loginService: SessionService;
	protected http: HttpClient;
	protected configService: AppConfigService;
	protected messageService: MessageService;

	// Map of badge identifiers to their task info
	private activeTasks = new Map<string, BadgeTaskInfo>();

	private taskUpdatesSource = new BehaviorSubject<{ badgeSlug: string; taskResult: TaskResult } | null>(null);
	public taskUpdates$ = this.taskUpdatesSource.asObservable();

	/** Inserted by Angular inject() migration for backwards compatibility */
	constructor(...args: unknown[]);

	constructor() {
		const loginService = inject(SessionService);
		const http = inject(HttpClient);
		const configService = inject(AppConfigService);
		const messageService = inject(MessageService);

		super(loginService, http, configService, messageService);
	
		this.loginService = loginService;
		this.http = http;
		this.configService = configService;
		this.messageService = messageService;
	}

	private checkTaskStatus(taskId: string, issuerSlug: string, badgeSlug: string): Promise<TaskResult> {
		const endpoint = `/v1/issuer/issuers/${issuerSlug}/badges/${badgeSlug}/batch-assertions/status/${taskId}`;
		return this.get<TaskResult>(endpoint).then((r) => r.body);
	}

	startTaskPolling(
		taskId: string,
		issuerSlug: string,
		badgeSlug: string,
		intervalMs: number = 2000,
	): Observable<TaskResult> {
		// If there's already an active task for this badge, stop it first
		this.stopTaskPolling(badgeSlug);

		const pollingObservable = timer(0, intervalMs).pipe(
			switchMap(() => this.checkTaskStatus(taskId, issuerSlug, badgeSlug)),
			takeWhile((result: TaskResult) => {
				const taskInfo = this.activeTasks.get(badgeSlug);
				if (taskInfo) {
					taskInfo.lastStatus = result;
				}

				this.taskUpdatesSource.next({ badgeSlug, taskResult: result });

				// Continue polling while task is not finished
				return result.status !== TaskStatus.SUCCESS && result.status !== TaskStatus.FAILURE;
			}, true), // Include the final emission
			shareReplay(1),
			catchError((error) => {
				console.error(`Error polling task status for badge ${badgeSlug}:`, error);
				this.activeTasks.delete(badgeSlug);
				throw error;
			}),
			// finalize(() => {
			// 	this.activeTasks.delete(badgeSlug);
			// }),
		);

		const taskInfo: BadgeTaskInfo = {
			taskId,
			issuerSlug,
			badgeSlug,
			observable: pollingObservable,
			lastStatus: null,
		};

		this.activeTasks.set(badgeSlug, taskInfo);

		return pollingObservable;
	}

	getTaskObservable(badgeSlug: string): Observable<TaskResult> | null {
		const taskInfo = this.activeTasks.get(badgeSlug);
		return taskInfo?.observable || null;
	}

	getLastTaskStatus(badgeSlug: string): TaskResult | null {
		const taskInfo = this.activeTasks.get(badgeSlug);
		return taskInfo?.lastStatus || null;
	}

	hasActiveTask(badgeSlug: string): boolean {
		return this.activeTasks.has(badgeSlug);
	}

	stopTaskPolling(badgeSlug: string): void {
		this.activeTasks.delete(badgeSlug);
	}

	getTaskUpdatesForBadge(badgeSlug: string): Observable<TaskResult> {
		return this.taskUpdates$.pipe(
			switchMap((update) => {
				if (update && update.badgeSlug === badgeSlug) {
					return [update.taskResult];
				}
				return EMPTY;
			}),
		);
	}

	clearAllTasks(): void {
		this.activeTasks.clear();
	}
}
