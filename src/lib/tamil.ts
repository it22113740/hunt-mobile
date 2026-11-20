/** Google Font used for Tamil script. Latin greetings stay in Bricolage. */
export const TAMIL_FONT = 'MeeraInimai_400Regular';

const TAMIL = /[\u0B80-\u0BFF]/;

export function isTamil(value: string) {
  return TAMIL.test(value);
}
