# Taking a payment for your customer's customer

For a product where your customer's own customers pay them through you: a deposit
on a booking, an order in a shop. Not a subscription paid to you; that is one
account and one webhook. Walked for real with Stripe Connect.

## The decision that shapes everything

**The money never passes through your account.** Use direct charges on your
customer's own Stripe account. They are the merchant of record, pay Stripe's fee,
own refunds and disputes. You never hold anyone's money.

Standard accounts cost your platform nothing and leave dispute losses with the
account owner, but onboarding is long (a full Stripe login and several screens).
Express accounts onboard in about two minutes but the platform covers losses a
connected account cannot pay, and has a per account monthly fee. Choose knowingly.

## Set up once (the owner's part)

1. Stripe, Connect, switch it on and complete the platform profile and its
   acknowledgements. Do this on day one: it has a review, and live accounts may
   need the account representative's identity document.
2. Work in a Stripe sandbox first. New Stripe accounts may block the older account
   creation API until "Accounts v1 support" is enabled in the sandbox's features.
3. A restricted key with only what is needed: Accounts and Account Links (platform,
   write), Checkout Sessions and Charges and Refunds (connected accounts, write).
4. A **Connected accounts** webhook destination with `checkout.session.completed`,
   `checkout.session.async_payment_succeeded`, `account.updated`,
   `account.application.deauthorized`. Its signing secret is separate from any
   billing webhook, and separate again in live mode.
5. Most hosts only apply new secrets on the next deploy.

## Build

1. **The connected account.** Create it once, store its id. Onboarding via an
   account link. Someone who abandons half way gets the same account back, never a
   second. Ready means `charges_enabled`, read on return and from `account.updated`.
2. **Hold, do not book.** Write the booking with status `held` and a `hold_until`.
   The double booking rule must count holds, or two people pay for one slot. Every
   reader that means "real booking" must exclude holds; check the lists that read
   every status.
3. **The pay page.** A Checkout Session created with the `Stripe-Account` header.
   `expires_at` cannot be under thirty minutes, so a shorter hold must handle a
   payment that lands late. Card only, unless every payment method settles
   instantly; methods that settle in days outlive a hold.
4. **Only the webhook confirms.** Never the return page: the customer can come back
   before Stripe reports, or never come back. Check amount and account against what
   was asked; a repeated event changes nothing.
5. **Paid for a time that is gone:** refund in full at once, and tell them.
6. **Refunds** on the connected account. A failed refund is recorded and shown to
   your customer, never swallowed.
7. **Cancelling goes through the server that holds the key**, in every mode, or the
   booking cancels and the money stays.

## Prove

- Database rules inside a transaction that ends by raising, so it rolls back and
  reports results without changing live data.
- The server against a fake Stripe, fake database and fake mail, recording calls.
- In Stripe test mode: connect a test account, book, pay with 4242 4242 4242 4242,
  confirm, let a hold expire, cancel early and see the refund, cancel as the business.

## Traps

- Revoking a database function from `public` can also take it from the service role
  your server uses. Grant it back and check before relying on it.
- A deposit the business can no longer take must not lock the item from editing.
  Refuse only a new or changed amount.
- Test addresses on reserved domains bounce; do not send real mail to them.
