import { BadgeClass } from '~/issuer/models/badgeclass.model';
import { StringMatchingUtil } from './string-matching-util';
import { Issuer } from '~/issuer/models/issuer.model';
import { ApiRecipientBadgeIssuer } from '~/recipient/models/recipient-badge-api.model';
import { RecipientBadgeInstance } from '~/recipient/models/recipient-badge.model';
import { RecipientBadgeCollection } from '~/recipient/models/recipient-badge-collection.model';
import { LearningPath } from '~/issuer/models/learningpath.model';
import { PublicApiBadgeClass } from '~/public/models/public-api.model';
import { ApiLearningPath } from '../model/learningpath-api.model';

export class MatchingAlgorithm {
	static issuerMatcher(inputPattern: string): (issuer: Issuer | ApiRecipientBadgeIssuer) => boolean {
		const patternStr = StringMatchingUtil.normalizeString(inputPattern);
		const patternExp = StringMatchingUtil.tryRegExp(patternStr);

		return (issuer) =>
			StringMatchingUtil.stringMatches(issuer.slug, patternStr, patternExp) ||
			StringMatchingUtil.stringMatches(issuer.name, patternStr, patternExp);
	}

	static badgeMatcher<T extends BadgeClass | RecipientBadgeInstance | PublicApiBadgeClass = BadgeClass>(
		inputPattern: string,
	): (badge: T) => boolean {
		const patternStr = StringMatchingUtil.normalizeString(inputPattern);
		const patternExp = StringMatchingUtil.tryRegExp(patternStr);

		return (badge) => {
			const badgeName = badge instanceof RecipientBadgeInstance ? badge.badgeClass.name : badge.name;

			return (
				StringMatchingUtil.stringMatches(badge.slug, patternStr, patternExp) ||
				StringMatchingUtil.stringMatches(badgeName, patternStr, patternExp)
			);
		};
	}

	static learningPathMatcher<T extends LearningPath | ApiLearningPath = LearningPath>(
		inputPattern: string,
	): (lp: T) => boolean {
		const patternStr = StringMatchingUtil.normalizeString(inputPattern);
		const patternExp = StringMatchingUtil.tryRegExp(patternStr);

		return (lp) => StringMatchingUtil.stringMatches(lp.name, patternStr, patternExp);
	}

	static collectionMatcher(inputPattern: string): (collection: RecipientBadgeCollection) => boolean {
		const patternStr = StringMatchingUtil.normalizeString(inputPattern);
		const patternExp = StringMatchingUtil.tryRegExp(patternStr);

		return (collection) => StringMatchingUtil.stringMatches(collection.name, patternStr, patternExp);
	}
}
