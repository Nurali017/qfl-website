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
                    { key: 'games_played', label: 'И', fullLabel: 'Игры', sortable: true, mobileVisible: true },
                    { key: 'wins', label: 'В', fullLabel: 'Победы', sortable: true, mobileVisible: true },
                    { key: 'draws', label: 'Н', fullLabel: 'Ничьи', sortable: true, mobileVisible: true },
                    { key: 'losses', label: 'П', fullLabel: 'Поражения', sortable: true, mobileVisible: true },
                    { key: 'goals_scored', label: 'ЗГ', fullLabel: 'Забитые голы', sortable: true, mobileVisible: true },
                    { key: 'goals_conceded', label: 'ПГ', fullLabel: 'Пропущ. голы', sortable: true, mobileVisible: true },
                    { key: 'goal_difference', label: 'РГ', fullLabel: 'Разница голов', sortable: true, mobileVisible: true },
                    { key: 'points', label: 'О', fullLabel: 'Очки', sortable: true, mobileVisible: true },
                ];
            case 'goals':
                return [
                    { key: 'goals_scored', label: 'Голы', sortable: true, mobileVisible: true },
                    { key: 'goals_per_match', label: 'Голы/М', fullLabel: 'Голы за матч', format: 'decimal', sortable: true, mobileVisible: true },
                    { key: 'goals_conceded', label: 'Пропущено', sortable: true, mobileVisible: true },
                    { key: 'goals_conceded_per_match', label: 'Проп/М', fullLabel: 'Пропущено за матч', format: 'decimal', sortable: true, mobileVisible: true },
                    { key: 'goal_difference', label: 'Разница', sortable: true, mobileVisible: true },
                    { key: 'xg', label: 'xG', format: 'decimal', sortable: true, mobileVisible: true },
                ];
            case 'attempts':
                return [
                    { key: 'shots', label: 'Удары', sortable: true, mobileVisible: true },
                    { key: 'shots_on_goal', label: 'В створ', fullLabel: 'В створ ворот', sortable: true, mobileVisible: true },
                    { key: 'shot_accuracy', label: 'Точность', sortable: true, format: 'percentage' },
                    { key: 'shots_per_match', label: 'Удары/М', fullLabel: 'Удары за матч', format: 'decimal', sortable: true, mobileVisible: true },
                ];
            case 'distribution':
                return [
                    { key: 'passes', label: 'Пас', fullLabel: 'Передачи', sortable: true, mobileVisible: true },
                    { key: 'pass_accuracy', label: 'Точн%', fullLabel: 'Точность передач', format: 'percentage', sortable: true, mobileVisible: true },
                    { key: 'key_passes', label: 'Ключ', fullLabel: 'Ключевые передачи', sortable: true, mobileVisible: true },
                    { key: 'crosses', label: 'Крос', fullLabel: 'Кроссы', sortable: true, mobileVisible: true },
                ];
            case 'attacking':
                return [
                    { key: 'possession', label: 'Влад', fullLabel: 'Владение', format: 'percentage', sortable: true, mobileVisible: true },
                    { key: 'dribbles', label: 'Дрб', fullLabel: 'Дриблинг', sortable: true, mobileVisible: true },
                    { key: 'dribble_success', label: 'Дрб%', fullLabel: 'Дриблинг %', format: 'percentage', sortable: true, mobileVisible: true },
                    { key: 'corners', label: 'Угл', fullLabel: 'Угловые', sortable: true, mobileVisible: true },
                ];
            case 'defending':
                return [
                    { key: 'tackles', label: 'Отб', fullLabel: 'Отборы', sortable: true, mobileVisible: true },
                    { key: 'interceptions', label: 'Пер', fullLabel: 'Перехваты', sortable: true, mobileVisible: true },
                    { key: 'recoveries', label: 'Возв', fullLabel: 'Возвраты', sortable: true, mobileVisible: true },
                    { key: 'offsides', label: 'Офс', fullLabel: 'Офсайды', sortable: true, mobileVisible: true },
                ];
            case 'disciplinary':
                return [
                    { key: 'fouls', label: 'Фолы', sortable: true, mobileVisible: true },
                    { key: 'yellow_cards', label: 'ЖК', fullLabel: 'Жёлтые карточки', sortable: true, mobileVisible: true },
                    { key: 'second_yellow_cards', label: '2ЖК', fullLabel: 'Вторые жёлтые', sortable: true, mobileVisible: true },
                    { key: 'red_cards', label: 'КК', fullLabel: 'Красные карточки', sortable: true, mobileVisible: true },
                    { key: 'fouls_per_match', label: 'Фолы/М', fullLabel: 'Фолы за матч', format: 'decimal', sortable: true, mobileVisible: true },
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
                    { key: 'minutes_played', label: 'Мин', labelKey: 'playerColumns.minutes_played', sortable: true, mobileVisible: true },
                ];
            case 'attempts':
                return [
                    { key: 'shots', label: 'Уд', labelKey: 'playerColumns.shots', sortable: true, mobileVisible: true },
                    { key: 'shots_on_goal', label: 'Дл', labelKey: 'playerColumns.shots_on_goal', sortable: true, mobileVisible: true },
                ];
            case 'distribution':
                return [
                    { key: 'passes', label: 'Пас', labelKey: 'playerColumns.passes', sortable: true, mobileVisible: true },
                    { key: 'pass_accuracy', label: 'Точн', labelKey: 'playerColumns.pass_accuracy', format: 'percentage', sortable: true, mobileVisible: true },
                    { key: 'key_passes', label: 'Ключ', labelKey: 'playerColumns.key_passes', sortable: true, mobileVisible: true },
                ];
            case 'attacking':
                return [
                    { key: 'dribble', label: 'Дрб', labelKey: 'playerColumns.dribble', sortable: true, mobileVisible: true },
                    { key: 'dribble_success', label: 'Усп%', labelKey: 'playerColumns.dribble_success', sortable: true, mobileVisible: true },
                    { key: 'xg', label: 'xG', labelKey: 'playerColumns.xg', format: 'decimal', sortable: true, mobileVisible: true },
                ];
            case 'defending':
                return [
                    { key: 'tackle', label: 'Отб', labelKey: 'playerColumns.tackle', sortable: true, mobileVisible: true },
                    { key: 'interception', label: 'Пер', labelKey: 'playerColumns.interception', sortable: true, mobileVisible: true },
                    { key: 'recovery', label: 'Возв', labelKey: 'playerColumns.recovery', sortable: true, mobileVisible: true },
                ];
            case 'goalkeeping':
                return [
                    { key: 'save_shot', label: 'Сейв', labelKey: 'playerColumns.save_shot', sortable: true, mobileVisible: true },
                    { key: 'dry_match', label: 'Сух', labelKey: 'playerColumns.dry_match', sortable: true, mobileVisible: true },
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
