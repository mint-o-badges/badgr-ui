import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LinkEntry } from '../bg-breadcrumbs/bg-breadcrumbs.component';

export type MenuItem = {
    title: string;
    routerLink?: string[] | string;
    icon: string;
    disabled?: boolean;
    action?: () => void;
};

type HeaderButtonBase = {
    title: string;
    disabled?: boolean;
};

type HeaderButtonWithLink = HeaderButtonBase & {
    routerLink: string[];
    action?: never;
};

type HeaderButtonWithAction = HeaderButtonBase & {
    routerLink?: never;
    action: () => void;
};

type HeaderButton = HeaderButtonWithLink | HeaderButtonWithAction;

export type CompetencyType = {
    name: string;
    description: string;
    studyLoad: number;
};

export interface PageConfig {
     crumbs?: LinkEntry[] | null;
     badgeTitle: string;
     headerButton?: HeaderButton | null,
     issuerSlug: string;
     slug: string;
     menuitems?: MenuItem[];
     createdAt?: Date;
     updatedAt?: Date;
     issuedOn?: Date;
     issuedTo?: string;
     category: string;
     tags: string[];
     issuerName: string;
     issuerImagePlacholderUrl: string;
     issuerImage: string;
     badgeLoadingImageUrl: string;
     badgeFailedImageUrl: string;
     badgeImage: string;
     badgeDescription: string;
     competencies?: CompetencyType[];
}

@Component({
	selector: 'bg-badgedetail',
    templateUrl: './badge-detail.component.html',
    styleUrls: ['./badge-detail.component.scss'],
})
export class BgBadgeDetail {
    @Input() config: PageConfig;
    @Input() awaitPromises?: Promise<any>[];
}
