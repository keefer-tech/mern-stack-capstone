require("dotenv").config();
const { v4: uuidv4 } = require("uuid");
const axios = require("axios").default;

//HELPERS
const SQUARE_API_CONFIG = {
  baseURL: "https://connect.squareupsandbox.com/v2",
  headers: {
    "Square-Version": "2020-05-28",
    Authorization: `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
    "Content-Type": "application/json",
  },
};

const abbreviate = (release_title, artists) => {
  const abr1 = release_title.slice(0, 3).toUpperCase();
  const abr2 = artists[0].slice(0, 3).toUpperCase();
  return abr1 + abr2;
};

const describe = (release_title, artists, format, label) => {
  const artist_string = artists.join(", ");
  const desc_string = `Title: ${release_title}, Artists: ${artist_string}, Format:${format}, Label: ${label}`;
  return `${desc_string}.`;
};

const buildVariation = (type, release_title, artists, price) => {
  return {
    id: `#${type}::${uuidv4()}`,
    type: "ITEM_VARIATION",
    item_variation_data: {
      item_id: `#${release_title}_${artists[0]}`,
      name: type.toUpperCase(),
      price_money: {
        amount: price,
        currency: "AUD",
      },
      pricing_type: "FIXED_PRICING",
      track_inventory: true,
    },
  };
};

//EXPORTS -- CATALOG
const addItem = async (
  release_title,
  artists,
  format,
  label,
  price,
  prelovedPrice
) => {
  const item = await axios.post(
    "/catalog/object",
    {
      idempotency_key: uuidv4(),
      object: {
        id: `#${release_title}_${artists[0]}`,
        type: "ITEM",
        item_data: {
          available_electronically: true,
          available_for_pickup: true,
          available_online: true,
          product_type: "REGULAR",
          skip_modifier_screen: true,
          abbreviation: abbreviate(release_title, artists),
          description: describe(release_title, artists, format, label),
          name: `${release_title} ${artists[0]}`,
          variations: [
            buildVariation("sealed", release_title, artists, price),
            buildVariation("preloved", release_title, artists, prelovedPrice),
          ],
        },
      },
    },
    SQUARE_API_CONFIG
  );
  return item.data;
};

const addItems = async (itemInfoArray) => {
  // check to make sure rate limit isn't surpassed
  if (itemInfoArray.length > 1000)
    return new Error("Tried to upsert more than 1000 items.");

  let batch = [];
  itemInfoArray.forEach((item) => {
    const {
      release_title,
      artists,
      format,
      label,
      price,
      prelovedPrice,
    } = item;
    batch.push({
      id: `#${release_title}_${artists[0]}`,
      type: "ITEM",
      item_data: {
        abbreviation: abbreviate(release_title, artists),
        description: describe(release_title, artists, format, label),
        name: `${release_title} ${artists[0]}`,
        variations: [
          buildVariation("sealed", release_title, artists, price),
          buildVariation("preloved", release_title, artists, prelovedPrice),
        ],
        available_electronically: true,
        available_for_pickup: true,
        available_online: true,
        product_type: "REGULAR",
        skip_modifier_screen: true,
      },
    });
  });

  const batchUpsert = await axios.post(
    "/catalog/batch-upsert",
    {
      idempotency_key: uuidv4(),
      batches: [{ objects: batch }],
    },
    SQUARE_API_CONFIG
  );

  return batchUpsert.data;
};

const deleteItems = async (squareIdsArray) => {
  const deleteLog = await axios.post(
    "/catalog/batch-delete",
    {
      object_ids: squareIdsArray,
    },
    SQUARE_API_CONFIG
  );
  return deleteLog.data;
};

const deleteItem = async (squareId) => {
  const deleteLog = await axios.delete(
    `/catalog/object/${squareId}`,
    SQUARE_API_CONFIG
  );
  return deleteLog.data;
};

const getCatalog = async (type = "item") => {
  const list = await axios.get(
    `/catalog/list?types=${type}`,
    SQUARE_API_CONFIG
  );

  const ids = list.data.objects.map((item) => item.id);

  return { ids: ids, detailed: list.data };
};

const getItem = async (squareId) => {
  const item = await axios.get(
    `/catalog/object/${squareId}`,
    SQUARE_API_CONFIG
  );
  return item.data;
};

const getItems = async (squareIdsArray) => {
  const items = await axios.post(
    "/catalog/batch-retrieve",
    {
      object_ids: squareIdsArray,
      include_related_objects: true,
    },
    SQUARE_API_CONFIG
  );
  return items.data;
};

//EXPORTS -- INVENTORY

module.exports = {
  addItem,
  addItems,
  deleteItems,
  deleteItem,
  getCatalog,
  getItem,
  getItems,
};