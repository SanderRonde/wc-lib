export interface Theme {
	/**
	 * The primary color
	 */
	primary: {
		/**
		 * The main primary color
		 */
		main: string,
		/**
		 * The weaker/lighter version of the primary color
		 */
		weak: string,
	},
	/**
	 * The accent/secondary color
	 */
	accent: {
		/**
		 * The main accent color
		 */
		main: string,
		/**
		 * The lighter version of the accent color
		 */
		weak: string,
	};
	/**
	 * The color of error messages
	 */
	error: string,
	/**
	 * The color of success messages
	 */
	success: string,
	/**
	 * Regular black text on this theme's background color
	 */
	text: string,
	/**
	 * The default page background color
	 */
	background: string
}