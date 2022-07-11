import path from 'path';
import fs from 'fs';
import consola from 'consola';

const logger = consola.withScope('swell');

export async function generateLangFiles(swell, locales) {
  await Promise.all(
    locales.map(async ({ code }) => {
      swell.options.locale = code;
      const localeSettings = await swell.get('/settings');

      const langPath = path.resolve(
        __dirname,
        '../../../static/lang',
        `${code}.json`,
      );

      fs.writeFileSync(
        langPath,
        JSON.stringify(localeSettings.lang || {}, null, '  '),
      );
    }),
  );

  logger.success('Generated language settings files');
}
