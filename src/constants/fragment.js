export const Company = `{
  name
  logo
}`;

export const Team = `{
  name
}`;

export const User = `{
  id
  firstName
  lastName
  email
}`;

export const Review = `{
  id
  content
  symbol
  company${Company}
  team${Team}
  user${User}
}`;
