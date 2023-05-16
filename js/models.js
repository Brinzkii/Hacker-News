'use strict';

const BASE_URL = 'https://hack-or-snooze-v3.herokuapp.com';

/******************************************************************************
 * Story: a single story in the system
 */

class Story {
	/** Make instance of Story from data object about story:
	 *   - {title, author, url, username, storyId, createdAt}
	 */

	constructor({ storyId, title, author, url, username, createdAt }) {
		this.storyId = storyId;
		this.title = title;
		this.author = author;
		this.url = url;
		this.username = username;
		this.createdAt = createdAt;
	}

	/** Parses hostname out of URL and returns it. */

	getHostName() {
		const url = new URL(this.url);
		return url.hostname;
	}
}

/******************************************************************************
 * List of Story instances: used by UI to show story lists in DOM.
 */

class StoryList {
	constructor(stories) {
		this.stories = stories;
	}

	/** Generate a new StoryList. It:
	 *
	 *  - calls the API
	 *  - builds an array of Story instances
	 *  - makes a single StoryList instance out of that
	 *  - returns the StoryList instance.
	 */

	static async getStories() {
		// Note presence of `static` keyword: this indicates that getStories is
		//  **not** an instance method. Rather, it is a method that is called on the
		//  class directly. Why doesn't it make sense for getStories to be an
		//  instance method?

		// query the /stories endpoint (no auth required)
		try {
			const response = await axios({
				url: `${BASE_URL}/stories`,
				method: 'GET',
			});

			// turn plain old story objects from API into instances of Story class
			const stories = response.data.stories.map((story) => new Story(story));

			// build an instance of our own class using the new array of stories
			return new StoryList(stories);
		} catch (err) {
			alert('There was an issue retrieving stories, one moment while we try again');
			setTimeout(this.getStories, 1000);
		}
	}

	/** Adds story data to API, makes a Story instance, adds it to story list.
	 * - user - the current instance of User who will post the story
	 * - obj of {title, author, url}
	 *
	 * Returns the new Story instance
	 */

	async addStory(user, newStory) {
		try {
			const response = await axios({
				url: `${BASE_URL}/stories`,
				method: 'POST',
				data: { token: user.loginToken, story: newStory },
			});

			return new Story(response.data.story);
		} catch (err) {
			alert('There was an issue posting your story, one moment while we try again');
			setTimeout(this.addStories(user, newStory), 1000);
		}
	}

	async deleteStory(storyId) {
		try {
			await axios({
				url: `${BASE_URL}/stories/${storyId}`,
				method: 'DELETE',
				data: { token: currentUser.loginToken },
			});
		} catch (err) {
			alert('There was an issue removing your story, one moment while we try again!');
		}
	}
}

/******************************************************************************
 * User: a user in the system (only used to represent the current user)
 */

class User {
	/** Make user instance from obj of user data and a token:
	 *   - {username, name, createdAt, favorites[], ownStories[]}
	 *   - token
	 */

	constructor({ username, name, createdAt, favorites = [], ownStories = [] }, token) {
		this.username = username;
		this.name = name;
		this.createdAt = createdAt;

		// instantiate Story instances for the user's favorites and ownStories
		this.favorites = favorites.map((s) => new Story(s));
		this.ownStories = ownStories.map((s) => new Story(s));

		// store the login token on the user so it's easy to find for API calls.
		this.loginToken = token;
	}

	/** Register new user in API, make User instance & return it.
	 *
	 * - username: a new username
	 * - password: a new password
	 * - name: the user's full name
	 */

	static async signup(username, password, name) {
		try {
			const response = await axios({
				url: `${BASE_URL}/signup`,
				method: 'POST',
				data: { user: { username, password, name } },
			});

			let { user } = response.data;

			return new User(
				{
					username: user.username,
					name: user.name,
					createdAt: user.createdAt,
					favorites: user.favorites,
					ownStories: user.stories,
				},
				response.data.token
			);
		} catch (err) {
			if (err.response.status === 409) {
				alert('That username has been taken, please choose another!');
			} else {
				alert('There was an error while signing up, please try again!');
			}
		}
	}

	/** Login in user with API, make User instance & return it.

   * - username: an existing user's username
   * - password: an existing user's password
   */

	static async login(username, password) {
		try {
			const response = await axios({
				url: `${BASE_URL}/login`,
				method: 'POST',
				data: { user: { username, password } },
			});

			let { user } = response.data;

			return new User(
				{
					username: user.username,
					name: user.name,
					createdAt: user.createdAt,
					favorites: user.favorites,
					ownStories: user.stories,
				},
				response.data.token
			);
		} catch (err) {
			alert('An error occurred while trying to login, please double check your credentials and try again!');
		}
	}

	/** When we already have credentials (token & username) for a user,
	 *   we can log them in automatically. This function does that.
	 */

	static async loginViaStoredCredentials(token, username) {
		try {
			const response = await axios({
				url: `${BASE_URL}/users/${username}`,
				method: 'GET',
				params: { token },
			});

			let { user } = response.data;

			return new User(
				{
					username: user.username,
					name: user.name,
					createdAt: user.createdAt,
					favorites: user.favorites,
					ownStories: user.stories,
				},
				token
			);
		} catch (err) {
			alert('loginViaStoredCredentials failed');
			return null;
		}
	}

	async addFavorite(star) {
		const favStoryId = $(star).parent().attr('id');

		try {
			await axios({
				url: `${BASE_URL}/users/${currentUser.username}/favorites/${favStoryId}`,
				method: 'POST',
				data: { token: currentUser.loginToken },
			});
			updateUserData();
		} catch (err) {
			alert('There was an issue adding the story to your favorites, one moment while we try again');
			setTimeout(this.addFavorite(star), 1000);
		}
	}

	async deleteFavorite(star) {
		const favStoryId = $(star).parent().attr('id');

		try {
			await axios({
				url: `${BASE_URL}/users/${currentUser.username}/favorites/${favStoryId}`,
				method: 'DELETE',
				data: { token: currentUser.loginToken },
			});
			updateUserData();
		} catch (err) {
			alert('There was an issue removing the story from your favorites, one moment while we try again');
			setTimeout(this.deleteFavorite(star), 1000);
		}
	}

	async updateCredentials(username, password) {
		try {
			const response = await axios({
				url: `${BASE_URL}/users/${currentUser.username}?token=${currentUser.loginToken}&password=${password}&username=${username}`,
				method: 'PATCH',
			});
		} catch (err) {
			alert('There was an error updating the account info, please try again!');
		}
	}
}
