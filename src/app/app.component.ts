import { Component } from '@angular/core';

interface IProperty {
  Name: string;
  Type: String;
  Nullable?: boolean;
}
interface IEntities {
  Name: string;
  Property: IProperty[]
}
interface IMember {
  Name: string;
  Value: Number;
}
interface IEnum {
  Name: string,
  Member: IMember[];
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Json To File';
  metData = ``;
  entities: IEntities[] = [];
  enums: IEnum[] = [];
  isShow = false;

  getData() {
    let data = JSON.parse(this.metData)
    let entityType = data.Edmx.DataServices.Schema.EntityType //shcema
    let entities: IEntities[] = []
    entityType.forEach((element: any) => {
      let newEnt: IEntities = {
        Name: '',
        Property: []
      }
      if (element._Name) {
        newEnt.Name = element._Name
        element.Property.forEach((e: any) => {
          if (e._Nullable) {
            newEnt.Property.push({ Name: e._Name, Type: e._Type.slice(4), Nullable: e._Nullable });
          } else {
            newEnt.Property.push({ Name: e._Name, Type: e._Type.slice(4) });
          }
        });
        entities.push(newEnt)
        newEnt = {
          Name: '',
          Property: []
        }
      } else {
        let newEls = element.item.ComplexType
        if (newEls.length) {
          newEls.forEach((el: any) => {
            newEnt.Name = el._Name
            if (el.Property.length) {
              el.Property.forEach((e: any) => {
                if (e._Nullable) {
                  newEnt.Property.push({ Name: e._Name, Type: e._Type.slice(4), Nullable: e._Nullable });
                } else {
                  newEnt.Property.push({ Name: e._Name, Type: e._Type.slice(4) });
                }
              });
            } else {
              if (el._Nullable) {
                newEnt.Property.push({ Name: el.Property._Name, Type: el.Property._Type.slice(4), Nullable: el._Nullable });
              }
              else {
                newEnt.Property.push({ Name: el.Property._Name, Type: el.Property._Type.slice(4) });
              }
            }
            entities.push(newEnt)
            newEnt = {
              Name: '',
              Property: []
            }
          });
        } else {
          newEnt.Name = newEls._Name
          if (newEls.Property.length) {
            newEls.Property.forEach((e: any) => {
              newEnt.Property.push({ Name: e._Name, Type: e._Type.slice(4) });
            });
          } else {
            newEnt.Property.push({ Name: newEls.Property._Name, Type: newEls.Property._Type.slice(4) });
          }
          entities.push(newEnt)
          newEnt = {
            Name: '',
            Property: []
          }
        }
      }
    });
    this.entities = entities;
    let enums: IEnum[] = [];
    let enumType: any = data.Edmx.DataServices.Schema.EnumType //shcema
    enumType.forEach((element: any) => {
      let name: string = element._Name;
      let member: IMember[] = [];
      element.Member.forEach((m: any) => {
        member = [...member, { Name: m._Name, Value: m._Value }];
      })
      enums = [...enums, { Name: name, Member: member }];
    });
    this.enums = enums;
  }

  showList() {
    this.getData();
    this.isShow = true;
  }

  downloadEnumFiles() {
    this.enums.forEach((element: IEnum, i: number) => {
      let text = 'export enum ' + element.Name + ' {\n';
      element.Member.forEach(m => {
        text += m.Name + ' = ' + m.Value + ',\n'
      })
      text += '}'
      setTimeout(() => {
        this.saveData(text, element.Name)
      }, i * 300)
    })
  }

  downLoadEntityFiles() {
    this.entities.forEach((entity: any, i: number) => {
      let text = 'export interface ' + entity.Name + ' {\n';
      entity.Property.forEach((prop: IProperty) => {
        // if (prop.Type.includes('ection(Store.')) {
        //   prop.Type = prop.Type.replace('ection(Store.', '').replace(')', '')
        // }
        text += prop.Name.charAt(0).toLocaleLowerCase().replace('??', 'i') + prop.Name.slice(1).replace('??', 'i');
        if (prop.Nullable) {
          text += ' : ';
        } else {
          text += ' ?: ';
        }
        if (prop.Type.includes('ection(Store.')) {
          text += prop.Type.toLowerCase().replace('??', 'i').replace('ection(edm.string)', 'string[]')
            .replace('int32', 'number').replace('e.', '').replace('int64', 'number')
            .replace('double', 'number').replace('datetimeoffset', 'string').replace('ection(stor', '').replace(')', '');
          text += '[]';
        }else{
          text += prop.Type.toLowerCase().replace('??', 'i').replace('ection(edm.string)', 'string[]')
            .replace('int32', 'number').replace('e.', '').replace('int64', 'number')
            .replace('double', 'number').replace('datetimeoffset', 'string');
        }
        text += ';\n';
        //.replace('ection(edm.string)', 'string[]')
      })
      text += '}'
      console.log('text: ', text);
      setTimeout(() => {
        this.saveData(text, entity.Name)
      }, i * 300)
    })
  }

  saveData(_data: string, _fileName: string) {
    let file = new Blob([_data]);
    let a = document.createElement("a"),
      url = URL.createObjectURL(file);
    a.href = url;
    a.download = _fileName + ".ts";
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 0);
  }

  close(id: string) {
    let el = document.getElementById(id);
    if (el?.classList.contains('close')) {
      el?.classList.remove('close');
    } else
      el?.classList.add('close');
  }
}
