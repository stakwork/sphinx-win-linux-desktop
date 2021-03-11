import * as Yup from "yup";
const rq = "Required";

const contact = [
  {
    name: "alias",
    type: "text",
    label: { en: "Name", es: "Nombre" },
    required: true,
    validator: Yup.string().required(rq),
  },
  // {
  //   name:'photo',
  //   type:'photo',
  //   label:{
  //     en:'Profile Image',
  //     es:'Imagen'
  //   }
  // },
  {
    name: "public_key",
    type: "pubkey",
    label: { en: "Address", es: "Address" },
    required: true,
    validator: Yup.string().required(rq),
  },
  {
    name: "route_hint",
    type: "text",
    label: { en: "Route Hint", es: "Route Hint" },
    required: true,
    validator: Yup.string(),
  },
];

const me = [
  {
    name: "alias",
    type: "text",
    label: { en: "Name", es: "Nombre" },
    required: true,
    validator: Yup.string().required(rq),
  },
  {
    name: "public_key",
    type: "pubkey",
    label: { en: "Address", es: "Address" },
    required: true,
    validator: Yup.string().required(rq),
  },
  {
    name: "route_hint",
    type: "text",
    label: { en: "Route Hint", es: "Route Hint" },
    required: false,
    validator: Yup.string(),
  },
  {
    name: "private_photo",
    type: "radio",
    inverted: true,
    label: { en: "Share your Profile Photo with Contacts" },
    required: false,
  },
];

const subscribe = [
  {
    name: "amount",
    type: "multibox",
    label: { en: "Amount", es: "Amount" },
    required: true,
    validator: Yup.object().shape({
      selected: Yup.string().required(rq),
    }),
    options: [
      { label: "500", value: 500, suffix: "sat" },
      { label: "1000", value: 1000, suffix: "sat" },
      { label: "2000", value: 2000, suffix: "sat" },
      {
        label: "Custom Amount:",
        value: "custom",
        suffix: "sat",
        custom: "number",
      },
    ],
  },
  {
    name: "interval",
    type: "multibox",
    label: { en: "Time Interval", es: "Time Interval" },
    required: true,
    validator: Yup.object().shape({
      selected: Yup.string().required(rq),
    }),
    options: [
      { label: "Daily", value: "daily" },
      { label: "Weekly", value: "weekly" },
      { label: "Monthly", value: "monthly" },
    ],
  },
  {
    name: "endRule",
    type: "multibox",
    label: { en: "End Rule", es: "End Rule" },
    required: true,
    validator: Yup.object().shape({
      selected: Yup.string().required(rq),
      custom: Yup.mixed().required(rq),
    }),
    options: [
      { label: "Make", value: "number", suffix: "Payments", custom: "number" },
      { label: "Pay Until", value: "date", custom: "date" },
    ],
  },
];

const tribe = [
  {
    name: "name",
    type: "text",
    label: { en: "Name", es: "Nombre" },
    required: true,
    validator: Yup.string().required(rq),
  },
  {
    name: "img",
    type: "photoURI",
    label: { en: "Group Image", es: "Group Image" },
  },
  {
    name: "description",
    type: "text",
    label: { en: "Description", es: "Description" },
    required: true,
    validator: Yup.string().required(rq),
  },
  {
    name: "tags",
    type: "tags",
    label: { en: "Tags", es: "Tags" },
    validator: Yup.array(),
  },
  {
    name: "price_to_join",
    type: "number",
    label: { en: "Price to Join", es: "Price to Join" },
    validator: Yup.number(),
  },
  {
    name: "price_per_message",
    type: "number",
    label: { en: "Price per Message", es: "Price per Message" },
    validator: Yup.number(),
  },
  {
    name: "escrow_amount",
    type: "number",
    label: { en: "Amount to Stake", es: "Amount to Stake" },
    validator: Yup.number(),
    description:
      "A spam protection mechanism: every subscriber pays this fee for each message, which is returned to them after after the amount of hours specific in Escrow Time",
  },
  {
    name: "escrow_time",
    type: "number",
    label: { en: "Time to Stake (Hours)", es: "Time to Stake (Hours)" },
    validator: Yup.number(),
    description:
      "The number of hours before the Escrow Amount is returned to the subscriber",
  },
  {
    name: "feed_url",
    type: "text",
    label: { en: "RSS Feed URL", es: "RSS Feed URL" },
    validator: Yup.string(),
  },
  {
    name: "unlisted",
    type: "radio",
    // inverted:true,
    label: { en: "Unlisted (do not show on tribes registry)" },
    required: false,
  },
  {
    name: "is_private",
    type: "radio",
    label: { en: "Private (requires permission to join)" },
    required: false,
  },
];

export { contact, me, tribe, subscribe };

function emptyStringToNull(value, originalValue) {
  if (typeof originalValue === "string" && originalValue === "") {
    return null;
  }
  return value;
}
