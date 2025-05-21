import { Routes } from "@angular/router";
import { environment } from "../environments/environment";
import { AuthGuard } from "./common/guards/auth.guard";
import { ForwardRouteComponent } from "./common/pages/forward-route.component";
import { InitialRedirectComponent } from "./initial-redirect.component";

export const ROUTE_CONFIG: Routes = [
    {
        path: '',
        redirectTo: '/initial-redirect',
        pathMatch: 'full',
    },
    {
        path: 'initial-redirect',
        component: InitialRedirectComponent,
    },
    {
        path: 'forward',
        component: ForwardRouteComponent,
    },
    {
        path: 'auth',
        loadChildren: () => import("./auth/auth.routes").then((m) => m.routes),
    },
    {
        path: 'signup',
        loadChildren: () => import("./signup/signup.module").then((m) => m.routes),
    },
    {
        path: 'recipient',
        loadChildren: () => import("./recipient/recipient.routes").then((m) => m.routes),
        canActivate: [AuthGuard],
    },
    {
        path: 'issuer',
        loadChildren: () => import("./issuer/issuer.routes").then((m) => m.routes),
        canActivate: [AuthGuard],
    },
    {
        path: 'profile',
        loadChildren: () => import("./profile/profile.routes").then((m) => m.routes),
        canActivate: [AuthGuard],
    },
    {
        path: 'public',
        loadChildren: () => import("./public/public.module").then((m) => m.routes),
    },
    {
        path: 'catalog',
        loadChildren: () => import("./catalog/catalog.routes").then((m) => m.routes),
    },
    ...(environment.config.api?.baseUrl != 'https://api.openbadges.education'
        ? [
            {
                path: 'showcase',
                loadChildren: () => import("./showcase/showcase.routes").then((m) => m.routes),
            },
        ]
        : []),
    // Legacy Auth Redirects
    {
        path: 'login',
        redirectTo: '/auth/login',
        pathMatch: 'full',
    },
    {
        path: 'login/:name',
        redirectTo: '/auth/login/:name',
        pathMatch: 'full',
    },
    {
        path: 'login/:name/:email',
        redirectTo: '/auth/login/:name/:email',
        pathMatch: 'full',
    },
    {
        path: 'change-password/:token',
        redirectTo: '/auth/change-password/:token',
        pathMatch: 'full',
    },
    // catchall
    {
        path: '**',
        redirectTo: '/initial-redirect',
    },
];