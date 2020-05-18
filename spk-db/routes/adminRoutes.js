const express = require('express'),
	ProductData = require('../model/ProductData'),
	adminRouter = express.Router(),
	upload = require('../middleware/multer'),
	client = require('./redis-search')

const router = () => {
	adminRouter.post('/add', upload.array('product'), async (req, res, next) => {
		const files = req.files
		const { product } = req.body
		const {
			itemId,
			itemName,
			itemType,
			itemPrice,
			itemDetails,
			itemBrand,
			itemColor,
		} = JSON.parse(product)
		const Product = {
			itemId,
			file: files,
			itemName,
			itemType,
			itemPrice,
			itemDetails,
			itemBrand,
			itemColor,
		}
		const newProduct = ProductData(Product)
		newProduct.save().then(() => res.json(newProduct._id))
		client.createIndex([
			client.fieldDefinition.numeric('itemId', true),
			client.fieldDefinition.text('itemName', true),
			client.fieldDefinition.text('itemType', true),
			client.fieldDefinition.numeric('itemPrice', true),
			client.fieldDefinition.text('itemDetails', true),
			client.fieldDefinition.text('itemBrand', true),
			client.fieldDefinition.text('itemColor', true),
		], function (error, val) {
			if (error) {
			} else {
			}
		})
		client.add(itemId, {
			itemId: itemId,
			itemName: itemName,
			itemType: itemType,
			itemPrice: itemPrice,
			itemDetails: itemDetails,
			itemBrand: itemBrand,
			itemColor: itemColor
		}, function (error, val) {
			if (error) {
			} else {
			}
		})
		const c = await client.getDoc(itemId)
		console.log("TCL: router -> c", c)
	})
	return adminRouter
}
module.exports = router
