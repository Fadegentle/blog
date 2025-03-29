import fs from 'fs';
import path from 'path';

const contentsDirectory = path.join(process.cwd(), 'contents');

export default function Home() {
  const items = fs.readdirSync(contentsDirectory)
    .filter(item => {
      const fullPath = path.join(contentsDirectory, item);
      const isDirectory = fs.statSync(fullPath).isDirectory();

      // 如果是目录，保留它
      if (isDirectory) {
        return true;
      }

      // 如果是文件，过滤掉隐藏文件和 License 文件，只保留 .md 文件
      return !item.startsWith('.') &&
        !item.toLowerCase().includes('license') &&
        item.endsWith('.md');
    });

  return (
    <main>
      <div className="nav-title">
        {/* <h2>Fadegentle WebSite</h2> */}
        <ul className="nav-list">
          {items.map((item) => {
            const fullPath = path.join(contentsDirectory, item);
            const isDirectory = fs.statSync(fullPath).isDirectory();

            return (
              <li key={item}>
                <a href={`/${item.replace(/\.md$/, '')}`}>
                  <div className="post-title">
                    {isDirectory ? `🗂️ ${item}` : item.replace(/\.md$/, '').split('-').join(' ')}
                  </div>
                  <div className="post-meta">
                    {!isDirectory && (
                      <span className="post-date">
                        {new Date().toLocaleDateString('zh-CN')}
                      </span>
                    )}
                  </div>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </main>
  );
}