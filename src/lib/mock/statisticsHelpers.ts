import { StatSubTab } from '@/types/statistics';

export interface ColumnDefinition {
    key: string;
    label: string;
    labelKey?: string;
    fullLabel?: string;
    format?: 'number' | 'percentage' | 'decimal';
    sortable?: boolean;
    mobileVisible?: boolean;
}

export function getMobileColumns(columns: ColumnDefinition[], sortBy: string, maxColumns = 2): ColumnDefinition[] {
    const mobileColumns = columns.filter(c => c.mobileVisible).slice(0, maxColumns);
    if (mobileColumns.some(c => c.key === sortBy)) return mobileColumns;
    const sortColumn = columns.find(c => c.key === sortBy);
    if (!sortColumn) return mobileColumns;
    if (mobileColumns.length >= maxColumns) {
        return [...mobileColumns.slice(0, -1), sortColumn];
    }
    return [...mobileColumns, sortColumn];
}

export function applyCustomColumns(
    columns: ColumnDefinition[],
    selected: Set<string>,
    sortBy: string,
): ColumnDefinition[] {
    const result = columns.filter(c => selected.has(c.key));
    if (!result.some(c => c.key === sortBy)) {
        const sortCol = columns.find(c => c.key === sortBy);
        if (sortCol) result.push(sortCol);
    }
    return result;
}

export function formatValue(value: any, format?: string) {
    if (value === null || value === undefined) return '-';
    if (format === 'percentage') return `${value}%`;
    if (format === 'decimal') return Number(value).toFixed(2);
    return value;
}

export function getColumnsForSubTab(subTab: StatSubTab, mode: 'clubs' | 'players'): ColumnDefinition[] {
    if (mode === 'clubs') {
        switch (subTab) {
            case 'key_stats':
                return [
                    { key: 'games_played', label: 'И', labelKey: 'clubColumns.games_played', sortable: true, mobileVisible: true },
                    { key: 'wins', label: 'В', labelKey: 'clubColumns.wins', sortable: true, mobileVisible: true },
                    { key: 'draws', label: 'Н', labelKey: 'clubColumns.draws', sortable: true, mobileVisible: true },
                    { key: 'losses', label: 'П', labelKey: 'clubColumns.losses', sortable: true, mobileVisible: true },
                    { key: 'goals_scored', label: 'ЗГ', labelKey: 'clubColumns.goals_scored', sortable: true, mobileVisible: true },
                    { key: 'goals_conceded', label: 'ПГ', labelKey: 'clubColumns.goals_conceded', sortable: true, mobileVisible: true },
                    { key: 'goal_difference', label: 'РГ', labelKey: 'clubColumns.goal_difference', sortable: true, mobileVisible: true },
                    { key: 'points', label: 'О', labelKey: 'clubColumns.points', sortable: true, mobileVisible: true },
                ];
            case 'goals':
                return [
                    { key: 'goals_scored', label: 'ЗГ', labelKey: 'clubColumns.goals_scored', sortable: true, mobileVisible: true },
                    { key: 'goals_per_match', label: 'ГМ', labelKey: 'clubColumns.goals_per_match', format: 'decimal', sortable: true, mobileVisible: true },
                    { key: 'goals_conceded', label: 'ПГ', labelKey: 'clubColumns.goals_conceded', sortable: true, mobileVisible: true },
                    { key: 'goals_conceded_per_match', label: 'ПМ', labelKey: 'clubColumns.goals_conceded_per_match', format: 'decimal', sortable: true, mobileVisible: true },
                    { key: 'goal_difference', label: 'РГ', labelKey: 'clubColumns.goal_difference', sortable: true, mobileVisible: true },
                    { key: 'xg', label: 'xG', labelKey: 'clubColumns.xg', format: 'decimal', sortable: true, mobileVisible: true },
                ];
            case 'attempts':
                return [
                    { key: 'shots', label: 'Уд', labelKey: 'clubColumns.shots', sortable: true, mobileVisible: true },
                    { key: 'shots_on_goal', label: 'Ст', labelKey: 'clubColumns.shots_on_goal', sortable: true, mobileVisible: true },
                    { key: 'shot_accuracy', label: 'Т%', labelKey: 'clubColumns.shot_accuracy', sortable: true, format: 'percentage', mobileVisible: true },
                    { key: 'shots_per_match', label: 'УМ', labelKey: 'clubColumns.shots_per_match', format: 'decimal', sortable: true, mobileVisible: true },
                ];
            case 'distribution':
                return [
                    { key: 'passes', label: 'Пс', labelKey: 'clubColumns.passes', sortable: true, mobileVisible: true },
                    { key: 'pass_accuracy', label: 'Т%', labelKey: 'clubColumns.pass_accuracy', format: 'percentage', sortable: true, mobileVisible: true },
                    { key: 'key_passes', label: 'Кл', labelKey: 'clubColumns.key_passes', sortable: true, mobileVisible: true },
                    { key: 'crosses', label: 'Кр', labelKey: 'clubColumns.crosses', sortable: true, mobileVisible: true },
                ];
            case 'attacking':
                return [
                    { key: 'possession', label: 'Вл', labelKey: 'clubColumns.possession', format: 'percentage', sortable: true, mobileVisible: true },
                    { key: 'dribbles', label: 'Др', labelKey: 'clubColumns.dribbles', sortable: true, mobileVisible: true },
                    { key: 'dribble_success', label: 'Д%', labelKey: 'clubColumns.dribble_success', format: 'percentage', sortable: true, mobileVisible: true },
                    { key: 'corners', label: 'Уг', labelKey: 'clubColumns.corners', sortable: true, mobileVisible: true },
                ];
            case 'defending':
                return [
                    { key: 'tackles', label: 'От', labelKey: 'clubColumns.tackles', sortable: true, mobileVisible: true },
                    { key: 'interceptions', label: 'Пр', labelKey: 'clubColumns.interceptions', sortable: true, mobileVisible: true },
                    { key: 'recoveries', label: 'Вз', labelKey: 'clubColumns.recoveries', sortable: true, mobileVisible: true },
                    { key: 'offsides', label: 'Оф', labelKey: 'clubColumns.offsides', sortable: true, mobileVisible: true },
                ];
            case 'disciplinary':
                return [
                    { key: 'fouls', label: 'Фл', labelKey: 'clubColumns.fouls', sortable: true, mobileVisible: true },
                    { key: 'yellow_cards', label: 'ЖК', labelKey: 'clubColumns.yellow_cards', sortable: true, mobileVisible: true },
                    { key: 'second_yellow_cards', label: '2Ж', labelKey: 'clubColumns.second_yellow_cards', sortable: true, mobileVisible: true },
                    { key: 'red_cards', label: 'КК', labelKey: 'clubColumns.red_cards', sortable: true, mobileVisible: true },
                    { key: 'fouls_per_match', label: 'ФМ', labelKey: 'clubColumns.fouls_per_match', format: 'decimal', sortable: true, mobileVisible: true },
                ];
            default:
                return [];
        }
    } else {
        // Players
        switch (subTab) {
            case 'key_stats':
            case 'goals':
                return [
                    { key: 'games_played', label: 'М', labelKey: 'playerColumns.games_played', sortable: true, mobileVisible: true },
                    { key: 'goals', label: 'Г', labelKey: 'playerColumns.goals', sortable: true, mobileVisible: true },
                    { key: 'assists', label: 'А', labelKey: 'playerColumns.assists', sortable: true, mobileVisible: true },
                    { key: 'minutes_played', label: 'Мн', labelKey: 'playerColumns.minutes_played', sortable: true, mobileVisible: true },
                ];
            case 'attempts':
                return [
                    { key: 'shots', label: 'Уд', labelKey: 'playerColumns.shots', sortable: true, mobileVisible: true },
                    { key: 'shots_on_goal', label: 'Дл', labelKey: 'playerColumns.shots_on_goal', sortable: true, mobileVisible: true },
                ];
            case 'distribution':
                return [
                    { key: 'passes', label: 'Пс', labelKey: 'playerColumns.passes', sortable: true, mobileVisible: true },
                    { key: 'pass_accuracy', label: 'Т%', labelKey: 'playerColumns.pass_accuracy', format: 'percentage', sortable: true, mobileVisible: true },
                    { key: 'key_passes', label: 'Кл', labelKey: 'playerColumns.key_passes', sortable: true, mobileVisible: true },
                ];
            case 'attacking':
                return [
                    { key: 'dribble', label: 'Др', labelKey: 'playerColumns.dribble', sortable: true, mobileVisible: true },
                    { key: 'dribble_success', label: 'У%', labelKey: 'playerColumns.dribble_success', sortable: true, mobileVisible: true },
                    { key: 'xg', label: 'xG', labelKey: 'playerColumns.xg', format: 'decimal', sortable: true, mobileVisible: true },
                ];
            case 'defending':
                return [
                    { key: 'tackle', label: 'От', labelKey: 'playerColumns.tackle', sortable: true, mobileVisible: true },
                    { key: 'interception', label: 'Пр', labelKey: 'playerColumns.interception', sortable: true, mobileVisible: true },
                    { key: 'recovery', label: 'Вз', labelKey: 'playerColumns.recovery', sortable: true, mobileVisible: true },
                ];
            case 'goalkeeping':
                return [
                    { key: 'save_shot', label: 'Св', labelKey: 'playerColumns.save_shot', sortable: true, mobileVisible: true },
                    { key: 'dry_match', label: 'Сх', labelKey: 'playerColumns.dry_match', sortable: true, mobileVisible: true },
                ];
            case 'disciplinary':
                return [
                    { key: 'yellow_cards', label: 'ЖК', labelKey: 'playerColumns.yellow_cards', sortable: true, mobileVisible: true },
                    { key: 'red_cards', label: 'КК', labelKey: 'playerColumns.red_cards', sortable: true, mobileVisible: true },
                ];
            default:
                return [];
        }
    }
}
