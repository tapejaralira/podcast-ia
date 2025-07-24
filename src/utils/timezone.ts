// src/utils/timezone.ts
import { DateTime } from 'luxon';

/**
 * Retorna a data atual no timezone de Manaus (America/Manaus - UTC-4)
 * @param formato Formato da data (padrão: 'yyyy-MM-dd')
 * @returns String com a data formatada
 */
export function getDataManaus(formato: string = 'yyyy-MM-dd'): string {
    return DateTime.now()
        .setZone('America/Manaus')
        .toFormat(formato);
}

/**
 * Retorna a data completa de Manaus para uso em roteiros
 * @returns String formatada como "23 de julho de 2025"
 */
export function getDataCompletaManaus(): string {
    return DateTime.now()
        .setZone('America/Manaus')
        .setLocale('pt-BR')
        .toFormat('d \'de\' MMMM \'de\' yyyy');
}

/**
 * Retorna o DateTime completo de Manaus para comparações
 * @returns DateTime object no timezone de Manaus
 */
export function getDateTimeManaus(): DateTime {
    return DateTime.now().setZone('America/Manaus');
}

/**
 * Converte uma data ISO para o timezone de Manaus
 * @param isoDate Data em formato ISO
 * @returns DateTime no timezone de Manaus
 */
export function convertToManausTime(isoDate: string): DateTime {
    return DateTime.fromISO(isoDate).setZone('America/Manaus');
}

/**
 * Retorna informações de debug sobre o timezone
 * @returns Object com informações de timezone
 */
export function getTimezoneInfo() {
    const manausTime = getDateTimeManaus();
    return {
        manausTime: manausTime.toISO(),
        manausDate: manausTime.toFormat('yyyy-MM-dd'),
        manausDateTime: manausTime.toFormat('yyyy-MM-dd HH:mm:ss'),
        utcTime: DateTime.utc().toISO(),
        offset: manausTime.offset,
        zoneName: manausTime.zoneName
    };
}

/**
 * Retorna a data de Manaus em formato compacto para logs
 * @returns String formatada como "23/07/2025 14:30"
 */
export function getDataHoraManausCompacta(): string {
    return DateTime.now()
        .setZone('America/Manaus')
        .toFormat('dd/MM/yyyy HH:mm');
}
