export const EventsCategories = [
    'All',
    'Family',
    'Fishing',
    'Fitness',
    'Food ',
    'Hunting',
    'Racing/Rodeo',
    'sports',
    'Trail Rides',
    'Travel ',
    'Uncategorized',
  ];
  
  export const Languages = [
    { name: 'Arabic', code: 'ar' },
    { name: 'Bosnian', code: 'bs' },
    { name: 'Bulgarian', code: 'bg' },
    { name: 'Chinese', code: 'zh' },
    { name: 'Croatian', code: 'hr' },
    { name: 'Czech', code: 'cs' },
    { name: 'Dutch', code: 'nl' },
    { name: 'English', code: 'en' },
    { name: 'French', code: 'fr' },
    { name: 'German', code: 'de' },
    { name: 'Greek', code: 'el' },
    { name: 'Hebrew', code: 'he' },
    { name: 'Hindi', code: 'hi' },
    { name: 'Hungarian', code: 'hu' },
    { name: 'Indonesian', code: 'in' },
    { name: 'Italian', code: 'it' },
    { name: 'Japanese', code: 'jp' },
    { name: 'Korean', code: 'ko' },
    { name: 'Latvian', code: 'lv' },
    { name: 'Lithuanian', code: 'lt' },
    { name: 'Malay', code: 'ms' },
    { name: 'Norwegian', code: 'no' },
    { name: 'Polish', code: 'pl' },
    { name: 'Portuguese', code: 'pt' },
    { name: 'Romanian', code: 'ro' },
    { name: 'Russian', code: 'ru' },
    { name: 'Serbian', code: 'sr' },
    { name: 'Slovak', code: 'sk' },
    { name: 'Slovenian', code: 'sl' },
    { name: 'Spanish', code: 'es' },
    { name: 'Swedish', code: 'sv' },
    { name: 'Thai', code: 'th' },
    { name: 'Turkish', code: 'tr' },
    { name: 'Ukrainian', code: 'uk' },
  ];
  
  export const LanguagesCode = Languages.map(({ code }) => code);
  
  export const createEventsUrlWithParam = (BASE_URL, query, user) => {
    const { search, language, category, page, type, country, title_search } =
      query;
    var url = BASE_URL;
    // var p = page || 1;
  
    if (search) {
      if (title_search && title_search == 'true') {
        url += `&qInTitle=${search}`;
      } else {
        url += `&q=${search}`;
      }
    }
  
    if (type == 'local') {
      url += `&country=${user.country}`;
    }
  
    if (type == 'global' && country) {
      url += `&country=${country}`;
    }
  
    if (category && EventsCategories.includes(category)) {
      url += `&category=${category}`;
    }
  
    if (language && LanguagesCode.includes(language)) {
      url += `&language=${language}`;
    } else {
      url += `&language=en`;
    }
  
    if (page) {
      url += `&page=${page}`;
    }
  
    return url;
  };
  