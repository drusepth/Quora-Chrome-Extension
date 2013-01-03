var ajax_transport = new XMLHttpRequest();
update_notifications();

function search()
{
	var q = document.getElementById("question_box").value;
	chrome.tabs.create({url: "http://www.quora.com/search?q=" + q + "&context_type=&context_id="});
}

function update_notifications()
{
	get_notifications();
	setTimeout(update_notifications, 60000);
}

function get_notifications()
{
	// sending request
	ajax_transport.open("GET", "http://api.quora.com/api/logged_in_user?fields=notifs,inbox", true);
	ajax_transport.onreadystatechange = process_notifications;
	ajax_transport.send(null); // Causes the error
}

function process_notifications()
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
	
	var name = json.name;
	var n_count = json.notifs.unseen_count;
	var m_count = json.inbox.unread_count;
	var t_notifs = json.notifs.unseen_aggregated_count;
	var notifs = json.notifs.unseen;
	
	if (name == "undefined" || n_count == "undefined" || t_notifs == "undefined" || notifs == "undefined")
	{
		// Error reading from api
		return;
	}
	
	// Notifications
	if (n_count > 0)
	{
		var notif_container = document.getElementById('n_list');
	
		// Add all notifications to popup
		for (var i = 0; i < (n_count > 5 ? 5 : n_count); i++)
		{
			var n = document.createElement('li');
			n.setAttribute('id', 'notif_' + i);
			n.setAttribute('class', 'notification');
			
			notif_container.appendChild(n);
			
			// Reformat as needed
			notifs[i] = notifs[i].replace(/<a href=/gi, "<a target=\"_quora\" href=");
			notifs[i] = notifs[i].replace(/<a action=/gi, "<a target=\"_quora\" action=");
			notifs[i] = notifs[i].replace(/<a target="_quora" href="#">.*?<\/a>/gi, ""); 
			notifs[i] = notifs[i].replace(/\. They need topics to get started: /, "");
			
			document.getElementById('notif_' + i).innerHTML = notifs[i];
		}
	}
	else
	{
		// Hide notifications container
		document.getElementById('notifications').style.display = 'none';
	}
	
	// Mail
	if (m_count > 0)
	{
		var container = document.getElementById('mail');
		
		container.innerHTML = 'You have <strong>' + m_count + '</strong> unread private message' 
			+ (m_count == 1 ? '.' : 's.') + '<br />'
			+ '<a href="http://www.quora.com/inbox" target="_quora">Click here to '
			+ 'visit your inbox.';
	}
	else
	{
		document.getElementById('mail').style.display = 'none';
	}
	
	// Update badge count
	var badgeText = (n_count > 0) ? String(n_count) : "";
	if (m_count > 0 && String(n_count).length < 3)
	{
		badgeText += ("/" + m_count);
	}
	chrome.browserAction.setBadgeText({text: badgeText});
}