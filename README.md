# Dusk Arbor Shopify theme

An Online Store 2.0 theme for an independent Real Relax retailer. The Shopify theme lives at the repository root. Shopify owns catalog records, media, variant pricing, inventory, cart totals and checkout.

## Open the chair catalog

Open [index.html](index.html) from a downloaded checkout and keep the adjacent assets directory with it. The standalone storefront lets a shopper open Alder, Linden and Sequoia, see each finish in three photographs, compare measurements and add finishes to a bag. The bag persists in the browser when storage is available. Contact Us can save an inquiry with the selected chairs.

In Shopify, mapped products submit their actual variant IDs to the native cart. The hosted Contact Us form is available from navigation, including before a merchant assigns a dedicated Contact page. Products with no native record have an availability inquiry. Set the USD variant prices in Shopify Admin to match the catalog: Alder $1,264.99, Linden $1,759.99, and Sequoia $2,529.99. Shopify handles market conversion, inventory checks and checkout.

## Review

Run `shopify theme check` from this directory. With an authorized test store, run `shopify theme dev --store <development-store>.myshopify.com`. Use that development preview to test the editor and native forms. The theme requires no asset build. To create an uploadable theme archive, run `shopify theme package`.

The base is Shopify’s JSON-template Skeleton revision `a4f32d393b9eadf6c4403318ca39116832e5d1df`. Shopify’s license is in LICENSE.md. The two font licenses are in assets.

## Connect Shopify resources

1. Create the native chair products with a single Color option. Use the merchant’s approved price, storefront SKU, inventory policy and location allocation for each variant. Keep private fulfillment mappings in the merchant’s operations system.
2. Create the manual collection named Massage chairs with handle `massage-chairs`. Set its default order to price, low to high. Select it under **Theme settings → Store resources**.
3. In Pages, assign the matching templates for Compare, Fit & delivery guide, About, Contact and FAQ. The Shipping and Warranty templates display merchant-approved page content. Set these page resources in theme settings. Native policy links appear when the shop has policy text. Select the store menus in the header and footer sections. Provide a monitored contact route.
4. Configure the lead and flagship sections and choose up to three comparison products. Each editor image override replaces only the editorial photograph.
5. Use the product information section for product app blocks. A Custom section supports additional theme and app blocks. The homepage sections support reordering and removal in the theme editor.

## Product data

The theme includes manufacturer specifications for Alder, Linden and Sequoia. It uses the matching Shopify metafield when you supply a value and omits unknown specifications. Alder’s weight is omitted because the manufacturer lists conflicting figures.

Use the product metafield namespace `chair` throughout. The same definitions drive the product, comparison and fit pages.

| Keys | Shopify type and unit |
| --- | --- |
| model, display_name (optional), highlight, mechanism, track, controls, supply | single_line_text_field |
| programs, positions, power_w | number_integer, power in watts |
| upright_depth, upright_width, upright_height | number_decimal, inches |
| reclined_depth, reclined_width, reclined_height | number_decimal, inches |
| carton_depth, carton_width, carton_height | number_decimal, inches |
| weight_lb | number_decimal, pounds, optional |
| features | list.single_line_text_field |
| manual | url |
| alternative | product_reference |

Set the studio image as the variant’s featured media. For the six catalog finishes, the theme pairs this image with the matching room photograph and track illustration. To use your own gallery, set the **variant** metafield `chair.gallery` to an ordered `list.file_reference` restricted to images. Select that finish’s room photograph first and its track illustration second. Assign descriptive alt text in Shopify. Variant links reload the product with the variant ID, so server-rendered prices, availability, galleries and add forms stay together with JavaScript disabled.

A theme branch controls presentation. The owner manages catalog records, navigation, policies, tax, payments and fulfillment separately in Admin. Native editor, checkout and end-to-end order verification require a review store.

The three Dusk Arbor display names are Alder, Linden and Sequoia. Set each product title in Shopify Admin to its Dusk Arbor name so hosted checkout, receipts and notifications match the storefront. The theme recognizes the existing supplier handles and model metafields. The optional product metafield `chair.display_name` overrides the native storefront label.
