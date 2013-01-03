
// Configuration
var delay_seconds = 60; // Seconds between requesting updates from Quora

// AJAX Object
var ajax_transport = new XMLHttpRequest();

// Start asynch updating
update();

// Functions
function update()
{
	// sending request
	ajax_transport.open("GET", "http://api.quora.com/api/logged_in_user?fields=notifs,inbox", true);
	ajax_transport.onreadystatechange = process;
	ajax_transport.send(null)
	
	// Do it again later
	setTimeout(update, 1000 * delay_seconds);
}

function process()
{
	if (ajax_transport.readyState != 4)
	{
		return;
	}
	
	// Strip while(1);
	var response = ajax_transport.responseText;
	response = response.substring("while(1);".length);
	
	// Parse json
	var json = JSON.parse(response);
	var n_count = json.notifs.unseen_count;
	var m_count = json.inbox.unread_count;
	
	// Update badge count
	var badgeText = (n_count > 0) ? String(n_count) : "";
	if (m_count > 0 && String(n_count).length < 3)
	{
		badgeText += ("/" + m_count);
	}
	chrome.browserAction.setBadgeText({text: badgeText});
}
