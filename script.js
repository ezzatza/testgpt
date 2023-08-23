const toggleSwitch = document.querySelector('#darkModeToggle');
toggleSwitch.addEventListener('change', switchTheme);

function switchTheme(event) {
  if (event.target.checked) {
    document.body.classList.add('dark-mode');
	document.nav.classList.remove('bg-skyblue');
  } else {
    document.body.classList.remove('dark-mode');
  }   
}

function clearContent(){
    document.getElementById('chatbox').innerHTML = '';
}

const url = new URL(window.location.href);
const key = url.searchParams.get('key');
    if (key) {
            $("#apiKey").val(key);
            $("#apiKey").hide();
    }	
const chatbox = $("#chatbox");
const userInput = $("#userInput");
const sendButton = $("#sendButton");
let messages = [];

sendButton.on("click", () => {
    const message = userInput.val();
    if (message) {
        messages.push({
            "role": "user",
            "content": message
        });
		const displaytext = window.markdownit().render(message);
		let userMessageHtml = '<pre><div class="message right-side "  >' + displaytext + '</div></pre>';
		chatbox.append(userMessageHtml);
		chatbox.animate({ scrollTop: 20000000 }, "slow");
        userInput.val("");
        sendButton.val("Generating Response...");
		sendButton.prop("disabled", true);
        fetchMessages();
    }
});

userInput.on("keydown", (event) => {
    if (event.keyCode === 13 && !event.ctrlKey && !event.shiftKey) {
        event.preventDefault();
        sendButton.click();
    } else if (event.keyCode === 13 && (event.ctrlKey || event.shiftKey)) {
        event.preventDefault();
        const cursorPosition = userInput.prop("selectionStart");
        const currentValue = userInput.val();

        userInput.val(
            currentValue.slice(0, cursorPosition) +
            "\n" +
            currentValue.slice(cursorPosition)
        );
        userInput.prop("selectionStart", cursorPosition + 1);

        userInput.prop("selectionEnd", cursorPosition + 1);
    }
});

function fetchMessages() {
	const apiKey = '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';
        var settings = {
            url: "https://api.openai.com/v1/chat/completions",
            method: "POST",
            timeout: 0,
            headers: {
                "Authorization": "Bearer " + apiKey,
                "Content-Type": "application/json"
            },
            data: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: messages
            })
        };
        $.ajax(settings).done(function(response) {
            const message = response.choices[0].message;
            messages.push({
                "role": message.role,
                "content": message.content
            });
			const htmlText = window.markdownit().render(message.content);
			const botMessageHtml = '<pre><div class="message left-side" id="' + CryptoJS.MD5(htmlText) + '">' + htmlText + '</div><i class="far fa-clipboard ml-1 btn btn-outline-dark" id="' + CryptoJS.MD5(htmlText) + '-copy"></i></pre>';             

            chatbox.append(botMessageHtml);	

			// Add event listener to the copy icon 
			var copyIcon = document.getElementById(CryptoJS.MD5(htmlText) + '-copy'); 
			var copyText = document.getElementById(CryptoJS.MD5(htmlText));

			copyIcon.addEventListener("click", function() {
			  var tempTextarea = document.createElement("textarea");
			  tempTextarea.value = copyText.textContent;
			  document.body.appendChild(tempTextarea);
			  tempTextarea.select();
			  document.execCommand("copy");
			  document.body.removeChild(tempTextarea);
			  
			  // Display "Copied!" popup
			  var copyPopup = document.getElementById("copy-popup");
			  copyPopup.style.display = "block";
			  setTimeout(function() {
				copyPopup.style.display = "none";
			  }, 1000); // Display for 1 second
			});
			
			chatbox.animate({ scrollTop: 20000000 }, "slow");
            sendButton.val("SUBMIT");
            sendButton.prop("disabled", false);
        }).fail(function(jqXHR, textStatus, errorThrown) {
			sendButton.val("Error");
			let errorText = "Error: " + jqXHR.responseJSON.error.message;
			let errorMessage = '<pre><div class="message left-side  text-danger" >' + errorText + '</div></pre>';
			chatbox.append(errorMessage);
			chatbox.animate({ scrollTop: 20000000 }, "slow");
		});
    }