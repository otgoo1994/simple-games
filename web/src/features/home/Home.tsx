import { EarthLock, Landmark, Grid2x2Plus, FileSliders, Handshake, BowArrow } from 'lucide-react';
import { Progress } from '@mantine/core';

export const Home = () => {
  const getFirstLetter = (text: string) => {
    return text[0];
  };

  const getRandomHexColor = () => {
    const color =
      '#' +
      Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, '0');

    return color;
  };
  return (
    <div className="home container">
      <p className="nickname mobile">Сайн уу, Отгонбаатар!</p>
      <div className="leaderboard">
        <div className="card">
          <p>Тэргүүлэгчид</p>
          <table>
            <tbody>
              <tr>
                <td>1</td>
                <td>
                  <div style={{ backgroundColor: getRandomHexColor() }}>
                    {getFirstLetter('Cyberdyne Syster')}
                  </div>
                </td>
                <td>Cyberdyne Syster</td>
                <td>9,377</td>
              </tr>
              <tr>
                <td>2</td>
                <td>
                  <div style={{ backgroundColor: getRandomHexColor() }}>
                    {getFirstLetter('0xFUN')}
                  </div>
                </td>
                <td>0xFUN</td>
                <td>9,142</td>
              </tr>
              <tr>
                <td>3</td>
                <td>
                  <div style={{ backgroundColor: getRandomHexColor() }}>
                    {getFirstLetter('Хишиг')}
                  </div>
                </td>
                <td>Хишиг</td>
                <td>8,042</td>
              </tr>
              <tr>
                <td>4</td>
                <td>
                  <div style={{ backgroundColor: getRandomHexColor() }}>
                    {getFirstLetter('ARESv')}
                  </div>
                </td>
                <td>ARESv</td>
                <td>7,651</td>
              </tr>
              <tr className="active">
                <td>5</td>
                <td>
                  <div style={{ backgroundColor: getRandomHexColor() }}>
                    {getFirstLetter('Отгонбаатар')}
                  </div>
                </td>
                <td>Отгонбаатар</td>
                <td>7,251</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="card hint">HINT</div>
      </div>
      <div className="grid-map">
        <p className="nickname desktop">Сайн уу, Отгонбаатар!</p>
        <div className="grids">
          <div className="card">
            <div className="card-body continue">
              <div className="card-body-header">
                <div className="icon">
                  <Landmark />
                </div>
                <div className="index">01</div>
              </div>
              <div className="card-body-content">Өгөгдлийн засаглал</div>
              <div className="card-body-footer">
                <div className="status">
                  <div>8/8 сорил</div>
                  <div className="point">500XP</div>
                </div>
                <Progress value={100} size="lg" />
                <button>дахин тоглох</button>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-body continue">
              <div className="card-body-header">
                <div className="icon">
                  <Grid2x2Plus />
                </div>
                <div className="index">02</div>
              </div>
              <div className="card-body-content">Өгөгдлийн чанар</div>
              <div className="card-body-footer">
                <div className="status">
                  <div>4/8 сорил</div>
                  <div className="point">250XP</div>
                </div>
                <Progress value={50} size="lg" />
                <button>дахин тоглох</button>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-body start">
              <div className="card-body-header">
                <div className="icon">
                  <FileSliders />
                </div>
                <div className="index">03</div>
              </div>
              <div className="card-body-content">Метадата</div>
              <div className="card-body-footer">
                <div className="status">
                  <div>0/8 сорил</div>
                  <div className="point">0XP</div>
                </div>
                <Progress value={0} size="lg" />
                <button>эхлэх</button>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-body start">
              <div className="card-body-header">
                <div className="icon">
                  <EarthLock />
                </div>
                <div className="index">04</div>
              </div>
              <div className="card-body-content">Мэдээллийн аюулгүй байдал</div>
              <div className="card-body-footer">
                <div className="status">
                  <div>0/8 сорил</div>
                  <div className="point">0XP</div>
                </div>
                <Progress value={0} size="lg" />
                <button>эхлэх</button>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-body start">
              <div className="card-body-header">
                <div className="icon">
                  <Handshake />
                </div>
                <div className="index">05</div>
              </div>
              <div className="card-body-content">Хэрэглээ</div>
              <div className="card-body-footer">
                <div className="status">
                  <div>0/8 сорил</div>
                  <div className="point">0XP</div>
                </div>
                <Progress value={0} size="lg" />
                <button>эхлэх</button>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-body start">
              <div className="card-body-header">
                <div className="icon">
                  <BowArrow />
                </div>
                <div className="index">06</div>
              </div>
              <div className="card-body-content">Risky</div>
              <div className="card-body-footer">
                <div className="status">
                  <div>0/8 сорил</div>
                  <div className="point">0XP</div>
                </div>
                <Progress value={0} size="lg" />
                <button>эхлэх</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
