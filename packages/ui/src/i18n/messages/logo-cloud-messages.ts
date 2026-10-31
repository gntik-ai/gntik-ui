/** Static logo cloud captions and live-preview copy. */
export const logoCloudEn = {
  'logoCloud.caption': 'Trusted by teams at companies of every size',
  'logoCloud.examples.community': 'Our community',
} as const;

export const logoCloudEs = {
  'logoCloud.caption': 'Equipos de empresas de todos los tamaños confían en nosotros',
  'logoCloud.examples.community': 'Nuestra comunidad',
} satisfies Record<keyof typeof logoCloudEn, string>;
