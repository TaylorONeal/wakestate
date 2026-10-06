import {
  NARCOLEPSY_DOMAIN_CONFIG, OVERLAPPING_DOMAIN_CONFIG,
  WAKE_DOMAIN_CONFIG, CONTEXT_DOMAIN_CONFIG,
  type CheckIn, type DomainConfig,
} from '@/types';

export interface CheckInDisplayDomain {
  key: string;
  label: string;
  color: string;
  value: number;
}

function configuredDomains<T extends object>(
  values: T, config: Record<keyof T, DomainConfig>,
): CheckInDisplayDomain[] {
  return (Object.keys(config) as Array<keyof T>).flatMap((key) => {
    const value = values[key];
    // Older/imported records may lack fields; absence is not a recorded score.
    if (typeof value !== 'number' || !Number.isFinite(value)) return [];
    return [{ key: String(key), label: config[key].label, color: config[key].color, value }];
  });
}

/** Render the recorded schema, never its compatibility defaults as observations. */
export function getCheckInDisplayDomains(checkIn: CheckIn): CheckInDisplayDomain[] {
  if (checkIn.narcolepsyDomains) {
    return [
      ...configuredDomains(checkIn.narcolepsyDomains, NARCOLEPSY_DOMAIN_CONFIG),
      ...(checkIn.overlappingDomains
        ? configuredDomains(checkIn.overlappingDomains, OVERLAPPING_DOMAIN_CONFIG) : []),
    ];
  }
  return [
    ...configuredDomains(checkIn.wakeDomains, WAKE_DOMAIN_CONFIG),
    ...(checkIn.contextDomains
      ? configuredDomains(checkIn.contextDomains, CONTEXT_DOMAIN_CONFIG) : []),
  ];
}
