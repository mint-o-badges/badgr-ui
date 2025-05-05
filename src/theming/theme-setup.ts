import { AppConfigService } from '../app/common/app-config.service';
import { EXPIRATION_DATE_STORAGE_KEY } from '../app/common/services/session.service';
import { BadgrTheme } from './badgr-theme';

/**
 * Initializes any data from the Badgr Theme definition.
 */
export function initializeTheme(configService: AppConfigService) {
	const selectedTheme = configService.theme;

	// Redirect the user to the alternate landing page if they aren't logged in and are requesting the root of the domain
	if (window.location.pathname === '/') {
		let hasSession = false;

		try {
			if (
				localStorage.getItem(EXPIRATION_DATE_STORAGE_KEY) ||
				sessionStorage.getItem(EXPIRATION_DATE_STORAGE_KEY)
			) {
				hasSession = true;
			}
		} catch (e) {}

		if (!hasSession && selectedTheme.alternateLandingUrl && selectedTheme.alternateLandingUrl.length > 0) {
			if (configService.featuresConfig.alternateLandingRedirect) {
				window.location.href = selectedTheme.alternateLandingUrl;
			}
		}
	}

	setupLoadingScreen(selectedTheme);
	writeFavicons(selectedTheme);
	setCssCustomPropColors(selectedTheme);
}

function writeFavicons(theme: BadgrTheme) {
	if (theme.favicons && theme.favicons.length && theme.favicons.length > 0) {
		for (let i = 0; i < theme.favicons.length; i++) {
			const favicon = theme.favicons[i];
			const link = document.createElement('link');
			link.setAttribute('rel', favicon.rel);
			link.setAttribute('href', favicon.href);
			if (favicon.sizes) {
				link.setAttribute('sizes', favicon.sizes);
			}
			document.head.appendChild(link);
		}
	}
}

function setCssCustomPropColors(theme: BadgrTheme) {
	for (const propName of Object.keys(theme.cssCustomProps)) {
		document.documentElement.style.setProperty(propName, theme.cssCustomProps[propName]);
	}
}

function setupLoadingScreen(theme: BadgrTheme) {
	const images = document.querySelectorAll('img.initial-loading-image');
	if (images && images.length > 0) {
		const img = images[0] as HTMLImageElement;

		img.src = theme.loadingImg.imageUrl;
		if (theme.loadingImg.width) {
			img.width = theme.loadingImg.width;
		}
		if (theme.loadingImg.height) {
			img.height = theme.loadingImg.height;
		}
	}
}
