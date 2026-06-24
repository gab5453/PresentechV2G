export const institutionConfig = {
  name:
    import.meta.env.VITE_INSTITUTION_NAME ||
    'Unidad Educativa Fiscomisional Fe y Alegría La Dolorosa',
  city: import.meta.env.VITE_INSTITUTION_CITY || '',
  address: 'Av. García Moreno S3-411 y Fe y Alegría',
  phone: '(02) 2012 130',
  phoneHref: 'tel:+59322012130',
  email: 'ue.ladolorosa@feyalegria.org.ec',
  facebookUrl: 'https://web.facebook.com/profile.php?id=100063766412094',
  logoUrl:
    import.meta.env.VITE_INSTITUTION_LOGO_URL ||
    '/logo_fe_y_alegria.png',
}
