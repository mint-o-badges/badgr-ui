import { LinkEntry } from '../bg-breadcrumbs/bg-breadcrumbs.component';

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
     issueQrRouterLink?: string[] | null;
     qrCodeButton?: boolean;
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