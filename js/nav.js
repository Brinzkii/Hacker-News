'use strict';

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories() {
	updateUserData();
	hidePageComponents();
	getAndShowStoriesOnStart();
}

$body.on('click', '#nav-all', navAllStories);

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
	hidePageComponents();
	$loginForm.show();
	$signupForm.show();
}

$navLogin.on('click', navLoginClick);

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
	hidePageComponents();
	$navLogin.hide();
	$navLogOut.show();
	$navLeft.show();
	putStoriesOnPage();
	$navUserProfile.text(`${currentUser.username}`).show();
}

// Show add story form when "submit" is clicked
$body.on('click', '#nav-submit', navSubmitClick);

function navSubmitClick() {
	if ($storyForm.is(':visible')) {
		$storyForm.hide();
	} else {
		navAllStories();
		$storyForm.show();
	}
}

// Filter stories to only show favorites when "favorites" is clicked
$body.on('click', '#nav-favorites', navFavsClick);

function navFavsClick() {
	updateUserData();
	hidePageComponents();

	if (currentUser.favorites.length === 0) {
		$noStoriesMsg.text('No favorites added!');
		$noStoriesMsg.show();
	} else {
		putFavoritesOnPage();
	}
}

// Filter stories to only show those created by current user and allow removal of stories
$body.on('click', '#nav-my-stories', navUserStoriesClick);

function navUserStoriesClick(evt) {
	updateUserData();
	hidePageComponents();

	if (currentUser.ownStories.length === 0) {
		$noStoriesMsg.text('No stories added by user yet!');
		$noStoriesMsg.show();
	} else {
		putUserStoriesOnPage();
	}
}

// Handle user profile click
$body.on('click', '#nav-user-profile', navUserProfileClick);

function navUserProfileClick() {
	let acctDate = currentUser.createdAt.slice(0, 10);
	hidePageComponents();
	$('.profile-name').text(`Name: ${currentUser.name}`);
	$('.profile-username').text(`Username: ${currentUser.username}`);
	$('.profile-creation-date').text(`Account Created: ${acctDate}`);
	$('.user-profile-info').show();
}
