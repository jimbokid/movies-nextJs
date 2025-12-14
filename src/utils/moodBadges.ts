import { moodBadges } from '@/data/moodBadges';
import { BadgeCategory, MoodBadge } from '@/types/discoverAi';

export function groupBadgesByCategory(badges: MoodBadge[] = moodBadges): [BadgeCategory, MoodBadge[]][] {
    const groups = new Map<BadgeCategory, MoodBadge[]>();

    badges.forEach(badge => {
        if (!groups.has(badge.category)) {
            groups.set(badge.category, []);
        }
        groups.get(badge.category)?.push(badge);
    });

    return Array.from(groups.entries());
}
