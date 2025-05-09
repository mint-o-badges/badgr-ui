import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, timer } from 'rxjs';
import { switchMap, takeWhile, catchError } from 'rxjs/operators';
import { BaseHttpApiService } from './base-http-api.service';
import { SessionService } from './session.service';
import { AppConfigService } from '../app-config.service';
import { MessageService } from './message.service';

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

@Injectable({
	providedIn: 'root',
})
export class TaskStatusService extends BaseHttpApiService {
	private taskIdSource = new BehaviorSubject<string | null>(null);
	public currentTaskId$ = this.taskIdSource.asObservable();

	private taskStatusSource = new BehaviorSubject<TaskResult | null>(null);
	public currentTaskStatus$ = this.taskStatusSource.asObservable();
	constructor(
		protected loginService: SessionService,
		protected http: HttpClient,
		protected configService: AppConfigService,
		protected messageService: MessageService,
	) {
		super(loginService, http, configService, messageService);
	}

	setTaskId(taskId: string): void {
		localStorage.setItem('currentTaskId', taskId);
		this.taskIdSource.next(taskId);
	}

	getTaskId(): string | null {
		const taskId = localStorage.getItem('currentTaskId');
		if (taskId && !this.taskIdSource.value) {
			this.taskIdSource.next(taskId);
		}
		return taskId;
	}

	clearTaskId(): void {
		localStorage.removeItem('currentTaskId');
		this.taskIdSource.next(null);
		this.taskStatusSource.next(null);
	}

	checkTaskStatus(taskId: string, issuerSlug: string, badgeSlug: string): Promise<TaskResult> {
		const endpoint = `/v1/issuer/issuers/${issuerSlug}/badges/${badgeSlug}/batch-assertions/status/${taskId}`;

		return this.get<TaskResult>(endpoint).then((r) => r.body);
	}

	pollTaskStatus(
		taskId: string,
		issuerSlug: string,
		badgeSlug: string,
		intervalMs: number = 2000,
	): Observable<TaskResult> {
		return timer(0, intervalMs).pipe(
			switchMap(() => this.checkTaskStatus(taskId, issuerSlug, badgeSlug)),
			takeWhile((result: TaskResult) => {
				this.taskStatusSource.next(result);

				return result.status !== TaskStatus.SUCCESS && result.status !== TaskStatus.FAILURE;
			}, true),
			catchError((error) => {
				console.error('Error polling task status:', error);
				throw error;
			}),
		);
	}
}
