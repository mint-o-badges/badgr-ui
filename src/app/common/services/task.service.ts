import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, timer } from 'rxjs';
import { switchMap, takeWhile, catchError, shareReplay } from 'rxjs/operators';
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
	constructor(
		protected loginService: SessionService,
		protected http: HttpClient,
		protected configService: AppConfigService,
		protected messageService: MessageService,
	) {
		super(loginService, http, configService, messageService);
	}

	checkTaskStatus(taskId: string, issuerSlug: string, badgeSlug: string): Promise<TaskResult> {
		const endpoint = `/v1/issuer/issuers/${issuerSlug}/badges/${badgeSlug}/batch-assertions/status/${taskId}`;
		return this.get<TaskResult>(endpoint).then((r) => r.body);
	}

	async getBadgeAwardingTasks(
		issuerSlug: string,
		badgeSlug: string,
	): Promise<{ taskId: string; batchAwardCount: number }[]> {
		const endpoint = `/v1/issuer/issuers/${issuerSlug}/badges/${badgeSlug}/batch-assertions`;
		return (await this.get<{ taskId: string; batchAwardCount: number }[]>(endpoint)).body;
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
				return result.status !== TaskStatus.SUCCESS && result.status !== TaskStatus.FAILURE;
			}, true),
			shareReplay(1),
			catchError((error) => {
				console.error(`Error polling task status with id ${taskId}:`, error);
				throw error;
			}),
		);
	}
}
