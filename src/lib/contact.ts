/**
 * The open contact channels, shared by the front page's contact door and the
 * footer: name, link (opened in a new tab) and a 24×24 line icon.
 */
export type Channel = { name: string; href: string; icon: string };

export const discord: Channel = {
	name: 'Discord',
	href: 'https://discord.gg/RxC5jwTUwS',
	icon: 'M7.5 6.2c1.4-.6 2.9-.9 4.5-.9s3.1.3 4.5.9c1.7 2.4 2.7 5.2 2.9 8.6-1.4 1.2-3 2-4.6 2.4l-1-1.7M7.5 6.2c-1.7 2.4-2.7 5.2-2.9 8.6 1.4 1.2 3 2 4.6 2.4l1-1.7M8.3 15c2.5 1 4.9 1 7.4 0 M8.6 11.6a1 1 0 1 0 2 0a1 1 0 1 0-2 0 M13.4 11.6a1 1 0 1 0 2 0a1 1 0 1 0-2 0'
};

export const telegram: Channel = {
	name: 'Telegram',
	href: 'https://t.me/+zULM_zTFApgxZTc8',
	icon: 'M21 4 3 11.2l5.6 2 2 6 3.1-3.4 4.7 3.4Z M8.6 13.2 21 4 10.6 15.2'
};
