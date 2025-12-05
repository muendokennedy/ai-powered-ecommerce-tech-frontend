users
-name
-email
-phone,
-status
-client_id,
-id,

orders 
-id,
-payment_details_id,
-order_tracking_number,
-user_id,
-status
-shipping_cost
-street_address
-apartment/suite
-Nearby_landmark
-city
-region
-postal_code
-country,
-delivery_instructions
-coordinates

products
-id,
-order_id,
-cart_id,
-watch_list_id,
-product_sku_id,
-product_name
-brand
-price,
-discount price,
-VAT,
-status
-stock
-supplier,
-description
-specifications,
-low_stock_alert
-category

product_images
-product_id
-primary_image
-second_image
-third_image

Admin

-name,
-email,
-phone,
-department,
-location
-profile_img
-admin_id
-permissions
-role
-status

admin_activity

admin_id,
action(json {action: timestamp})
last_login,
total_actions

payment_details

id,
order_id,
payment_method
payment_status,
payment_details

cart

id,
user_id,

watch_list

id,
user_id
