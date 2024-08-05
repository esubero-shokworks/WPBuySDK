
const getUTMs = () => {
    let UTMs = {
        "utm_source": "google",
        "utm_medium": "cpc",
        "utm_campaign": "summer_sale",
        "utm_term": "buy_courses",
        "utm_content": "ad_1"
    };

    return UTMs;
}

const shopifyCheckout = async () => {
    try {
        const client = ShopifyBuy.buildClient({
            domain: "checkout.myimprov.com",
            storefrontAccessToken: "99d38ea90b461c659c2e1b62f7940127",
        });
        product_ids = [9513933603136, 9508059676992];

        const utmParams = getUTMs();

        const checkout = await client.checkout.create();
        const checkoutId = checkout.id;

        const lineItemsToAdd = await Promise.all(
            product_ids.map(async (product_id) => {
                const productId = `gid://shopify/Product/${product_id}`;
                try {
                    const product = await client.product.fetch(productId);
                    if (product.variants.length === 0) {
                        console.error(`Product ${product_id} doesn't have available variants.`);
                        return null;
                    }
                    console.log("Product: ", product);
                    return product.variants.map((variant) => ({
                        variantId: variant.id,
                        quantity: 1,
                    }));
                } catch (error) {
                    console.error(`Error getting product ${product_id}:`, error);
                    return null;
                }
            })
        );

        const flatLineItemsToAdd = []
            .concat(...lineItemsToAdd)
            .filter((item) => item !== null);

        console.log("final data", lineItemsToAdd);
        console.log("After filter", flatLineItemsToAdd);

        if (flatLineItemsToAdd.length > 0) {
            try {
                const updatedCheckout = await client.checkout.addLineItems(
                    checkoutId,
                    flatLineItemsToAdd
                );  

                const checkoutUrl = updatedCheckout.webUrl;

                const checkoutAttributes = Object.entries(utmParams).map(([key, value]) => ({
                    key: key,
                    value: value
                }));

                client.checkout.updateAttributes(checkout.id, {
                    customAttributes: checkoutAttributes
                }).then((updatedCheckout) => {
                    console.log("all checkout: "+ JSON.stringify(updatedCheckout.customAttributes));
                    console.log("Redireccionar a la URL de checkout:", updatedCheckout.webUrl);
                });
                
                console.log("all checkout", updatedCheckout);
                console.log("call to action:", checkoutUrl);
                console.log("Redireccionar a la URL de checkout:", checkoutUrl);

                // Redirigir a la URL de checkout
                // window.location.href = checkoutUrl;
            } catch (error) {
                console.error("Error agregando producto al carrito:", error);
            }
        } else {
            console.error("No se pudieron agregar productos al carrito.");
        }
    } catch (error) {
        console.error("Error en el proceso de checkout:", error);
    }
};
