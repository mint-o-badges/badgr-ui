import { PublicApiLearningPath } from '../../../public/models/public-api.model';
import { ApiLearningPath } from '../../model/learningpath-api.model';
import { LinkEntry } from '../bg-breadcrumbs/bg-breadcrumbs.component';
import { BadgeClassCopyPermissions } from '../../../issuer/models/badgeclass-api.model';

type MenuItemBase = {
	title: string;
	routerLink?: string[] | string;
	icon?: any;
	disabled?: boolean;
	action?: (args?: any) => void;
};

type MenuItemWithLink = MenuItemBase & {
	routerLink: string[];
	action?: never;
};

type MenuItemWithAction = MenuItemBase & {
	routerLink?: never;
	action: (args?: any) => void;
};

export type MenuItem = MenuItemWithLink | MenuItemWithAction;

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

type QrCodeButton = {
	show: boolean;
	title?: string;
	disabled?: boolean;
	action?: () => void;
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
	headerButton?: HeaderButton | null;
	issueQrRouterLink?: string[] | null;
	qrCodeButton?: QrCodeButton;
	issuerSlug: string;
	slug: string;
	menuitems?: MenuItem[];
	createdAt?: Date;
	updatedAt?: Date;
	issuedOn?: Date;
	issuedTo?: string;
	duration?: string;
	category: string;
	tags: string[];
	issuerName: string;
	issuerImagePlacholderUrl: string;
	issuerImage: string;
	badgeLoadingImageUrl: string;
	badgeFailedImageUrl: string;
	badgeImage: string;
	badgeDescription: string;
	badgeCriteria: Array<string | object>;
	competencies?: CompetencyType[];
	license?: boolean;
	id?: string;
	shareButton?: boolean;
	badgeInstanceSlug?: string;
	learningPaths?: PublicApiLearningPath[] | ApiLearningPath[];
	copy_permissions?: BadgeClassCopyPermissions[];
	criteria?: string[]
	customCriteria?: Array<{name: string; description: string;}>
}
