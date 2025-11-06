export const getAvatarSize = (selectorType: 'id' | 'class', selector: string) => {
  let avatarSize: string | number = 100;
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return avatarSize;
  }

  const element =
    selectorType == 'id' ? document.getElementById(selector) : document.querySelector(selector);

  if (element == null) return avatarSize;

  avatarSize = getComputedStyle(element).getPropertyValue('--avatar-size');

  if (avatarSize.endsWith('em')) {
    const textSize = Number(
      getComputedStyle(element).getPropertyValue('font-size').replace('px', '')
    );

    avatarSize = Number(Number(avatarSize.replace('em', '')) * textSize);
  }

  if (typeof avatarSize !== 'number') {
    avatarSize = Number(avatarSize.replace('em', '').replace('rem', '').replace('px', ''));
  }

  return Number(avatarSize);
};
