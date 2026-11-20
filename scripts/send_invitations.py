"""Read a single invitation batch from stdin. Report each SMTP acceptance immediately."""
import json
import smtplib
import ssl
import sys
from email.headerregistry import Address
from email.message import EmailMessage


def send_batch(batch):
    config = batch["config"]
    context = ssl.create_default_context()
    port = config["port"]
    if port == 465:
        client = smtplib.SMTP_SSL(config["host"], port, timeout=15, context=context)
    else:
        client = smtplib.SMTP(config["host"], port, timeout=15)
    with client:
        if port != 465:
            client.starttls(context=context)
        client.login(config["user"], config["password"])
        sender = Address(addr_spec=config["from"])
        for item in batch["messages"]:
            try:
                recipient = Address(addr_spec=item["email"])
                message = EmailMessage()
                message["From"] = sender
                message["To"] = recipient
                message["Subject"] = "Dein Feedback zu den Projektwochen"
                message.set_content(item["body"])
                client.send_message(message, from_addr=sender.addr_spec, to_addrs=[recipient.addr_spec])
            except (ValueError, smtplib.SMTPRecipientsRefused):
                continue
            print(item["token"], flush=True)


if __name__ == "__main__":
    send_batch(json.load(sys.stdin.buffer))

