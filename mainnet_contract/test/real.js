const RLP = require("rlp");
const util = require("@ethereumjs/util");
const secp256k1 = require("secp256k1");
const HeaderReader = artifacts.require("HeaderReader");
const Subnet = artifacts.require("Subnet");

const hex2Arr = (hexString) => {
  if (hexString.length % 2 !== 0) {
      throw "Must have an even number of hex digits to convert to bytes";
  }
  var numBytes = hexString.length / 2;
  var byteArray = new Uint8Array(numBytes);
  for (var i=0; i<numBytes; i++) {
      byteArray[i] = parseInt(hexString.substr(i*2, 2), 16);
  }
  return byteArray;
}

contract("Subnet Real Sample Test", async accounts => {
  beforeEach(async () => {
    this.validators_addr = [
      "0x888c073313b36cf03CF1f739f39443551Ff12bbE",
      "0x5058dfE24Ef6b537b5bC47116A45F0428DA182fA",
      "0xefEA93e384a6ccAaf28E33790a2D1b2625BF964d"
    ];
    

    this.genesis_encoded = "0xF90296A00000000000000000000000000000000000000000000000000000000000000000A01DCC4DE8DEC75D7AAB85B567B6CCD41AD312451B948A7413F0A142FD40D49347940000000000000000000000000000000000000000A031ACC0F47DDB4B89AA9BE984984FE2C34655611275EB935E9D0DCD09603D8C07A056E81F171BCC55A6FF8345E692C0F86E5B48E01B996CADC001622FB5E363B421A056E81F171BCC55A6FF8345E692C0F86E5B48E01B996CADC001622FB5E363B421B901000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001808347B7608084643435ACB89D00000000000000000000000000000000000000000000000000000000000000005058DFE24EF6B537B5BC47116A45F0428DA182FA888C073313B36CF03CF1F739F39443551FF12BBEEFEA93E384A6CCAAF28E33790A2D1B2625BF964D0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000A0000000000000000000000000000000000000000000000000000000000000000088000000000000000080C0C080";
    this.genesis_hash = web3.utils.sha3(Buffer.from(hex2Arr(this.genesis_encoded.slice(2)))).toString("hex");
    this.block1_encoded = "0xF902E7A02E79DF1A00D1476063BA6EF75FF9E9FBAA6FC3F6F87F2E5CA2B19AE37B9F4543A01DCC4DE8DEC75D7AAB85B567B6CCD41AD312451B948A7413F0A142FD40D4934794EFEA93E384A6CCAAF28E33790A2D1B2625BF964DA09B21C68C6B49C9BC5DFF95F7AD6BD69920A97F54A56D5D1C72BCC608B95825D8A0A3BA846F7BAC944A3A323E083CF3A1E8722D78708216A46C99963ABA1DB42585A037677206C85D7BF905A2F29D9380C65C8D6F7231B1C5A36CB628BC5CCC0FE4D0B90100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000101841908B1008263088464343A44AA02E802E6E3A02E79DF1A00D1476063BA6EF75FF9E9FBAA6FC3F6F87F2E5CA2B19AE37B9F45438080C080A00000000000000000000000000000000000000000000000000000000000000000880000000000000000B84130EDF5FC28D539DCC22AA4C712D90DA368A0F956D0B72CD1355475311B4D669368159D6E5E8296D762265DEBD133FDC301BACFE64D37F9596ACF80AA5346686400F83F945058DFE24EF6B537B5BC47116A45F0428DA182FA94888C073313B36CF03CF1F739F39443551FF12BBE94EFEA93E384A6CCAAF28E33790A2D1B2625BF964DF83F945058DFE24EF6B537B5BC47116A45F0428DA182FA94888C073313B36CF03CF1F739F39443551FF12BBE94EFEA93E384A6CCAAF28E33790A2D1B2625BF964D80"
    this.block1_hash = web3.utils.sha3(Buffer.from(hex2Arr(this.block1_encoded.slice(2)))).toString("hex");

    this.lib = await HeaderReader.new();
    Subnet.link("HeaderReader", this.lib.address);
    this.subnet = await Subnet.new(
      this.validators_addr,
      this.genesis_encoded,
      this.block1_encoded,
      450,
      900,
      {"from": accounts[0]}
    );
  })

  it("Receive New Header", async() => {

    const block2_encoded = "0xF902F1A0B09A86862B9BBF90E57A81C7F524D0C71E886F716E204C81FD84266B3B779705A01DCC4DE8DEC75D7AAB85B567B6CCD41AD312451B948A7413F0A142FD40D49347945058DFE24EF6B537B5BC47116A45F0428DA182FAA02782BC175424ED837DFEA39BCEF34A75C0BAAACA3083ABAFAD631C46D10A9FF1A0D4E0EFE3CBA3CF72038E7E7F04C62D13425706DD8ED0EAE692ADD3E347E4B5CFA037677206C85D7BF905A2F29D9380C65C8D6F7231B1C5A36CB628BC5CCC0FE4D0B90100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000102841908B1008263088464343A46B8B302F8B003F8ADE3A0B09A86862B9BBF90E57A81C7F524D0C71E886F716E204C81FD84266B3B7797050201F886B8415DCD791A9C53F145F50AF2FCF46E9E4DB60145B484DB8A2DD6C7431CCDF486133A0BF1BE7F79763B6FD91F06BA9A4C3FAAF1B7CF3236D2388F56785E09C460C300B841F1325D2A58ABA54FAF7E707CC1865E8592315ECCE6F281EC43E71C0C36670D0F13CDCA2BC454C555DB9C1F4447850E21D2F005326F33CE1AFE3F984C3E2EE2980180A00000000000000000000000000000000000000000000000000000000000000000880000000000000000B841F0105FD7F3C8D60EA70995D41C7FF3AC843D4B5901B1C61028CDF59B2F2134F9028914EE0C9A6ED47B57F18A3354FE6673A3D07E4DCE71BF64F30A41ABD6D08701C0C080";
    const block2_hash = web3.utils.sha3(Buffer.from(hex2Arr(block2_encoded.slice(2)))).toString("hex");
    await this.subnet.receiveHeader([block2_encoded]);

    const block2_resp = await this.subnet.getHeader(block2_hash);
    const latest_blocks = await this.subnet.getLatestBlocks();
    assert.equal(block2_resp[4], false);
    assert.equal(latest_blocks["0"][0], block2_hash);
    assert.equal(latest_blocks["1"][0], this.block1_hash);
  });

  // it("Receive New Header", async() => {

  //   const block2_encoded = "0xf90339a04a0ccf7e1f17edd8c2005d3da5f5e99c4dca0398a6fe15fb10059edeede8fff2a01dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d4934794efea93e384a6ccaaf28e33790a2d1b2625bf964da0d69fe3ca3b3a4fc39f30af6b8de51e84a33427136fa7332e91cf327d52602038a06189ebf5a1055c6c4a6b1ccf9cc1db7dd8df672307004a42e661a5406dd95955a037677206c85d7bf905a2f29d9380c65c8d6f7231b1c5a36cb628bc5ccc0fe4d0b9010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000018206ff841908b1008263088464345f82b8b902f8b6820708f8b1e7a04a0ccf7e1f17edd8c2005d3da5f5e99c4dca0398a6fe15fb10059edeede8fff28207078206fef886b841db530686dd0118288b305a5c7e7737dfd9b239847dbbdc9904759751d435295d333c081653913df4e4eba7bbb554eece998510f9f6737bd1f95f520ecd6338f201b841fd217a3916887f64394ea07a1d5bc35929c70b8033972637b2b7ae0a6717e15e722473228e5dd833fe9fc6f909fd4182e6a627ed5419498c3ba89216c15e3a530080a00000000000000000000000000000000000000000000000000000000000000000880000000000000000b841424c55b11177aa74b5586a11d72d043eef4ed71e101f5ee3c46d5d9bde8aadeb793d4e593c5c7df7c4af5d4cbb69f38b21d666d5d3952e6fb44b9287c221e14201f83f94efea93e384a6ccaaf28e33790a2d1b2625bf964d94888c073313b36cf03cf1f739f39443551ff12bbe945058dfe24ef6b537b5bc47116a45f0428da182fac080";
  //   console.log(await this.lib.getValidationParams(block2_encoded));
  // });

  it("Confirm A Received Block", async() => {

    const block2_encoded = "0xF902F1A0B09A86862B9BBF90E57A81C7F524D0C71E886F716E204C81FD84266B3B779705A01DCC4DE8DEC75D7AAB85B567B6CCD41AD312451B948A7413F0A142FD40D49347945058DFE24EF6B537B5BC47116A45F0428DA182FAA02782BC175424ED837DFEA39BCEF34A75C0BAAACA3083ABAFAD631C46D10A9FF1A0D4E0EFE3CBA3CF72038E7E7F04C62D13425706DD8ED0EAE692ADD3E347E4B5CFA037677206C85D7BF905A2F29D9380C65C8D6F7231B1C5A36CB628BC5CCC0FE4D0B90100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000102841908B1008263088464343A46B8B302F8B003F8ADE3A0B09A86862B9BBF90E57A81C7F524D0C71E886F716E204C81FD84266B3B7797050201F886B8415DCD791A9C53F145F50AF2FCF46E9E4DB60145B484DB8A2DD6C7431CCDF486133A0BF1BE7F79763B6FD91F06BA9A4C3FAAF1B7CF3236D2388F56785E09C460C300B841F1325D2A58ABA54FAF7E707CC1865E8592315ECCE6F281EC43E71C0C36670D0F13CDCA2BC454C555DB9C1F4447850E21D2F005326F33CE1AFE3F984C3E2EE2980180A00000000000000000000000000000000000000000000000000000000000000000880000000000000000B841F0105FD7F3C8D60EA70995D41C7FF3AC843D4B5901B1C61028CDF59B2F2134F9028914EE0C9A6ED47B57F18A3354FE6673A3D07E4DCE71BF64F30A41ABD6D08701C0C080";
    const block2_hash = web3.utils.sha3(Buffer.from(hex2Arr(block2_encoded.slice(2)))).toString("hex");
    const block3_encoded = "0xF902F1A02C4265C60FAA7BE948C2BCF897528B5BE49EE255DC63A59AC485A27A791CE455A01DCC4DE8DEC75D7AAB85B567B6CCD41AD312451B948A7413F0A142FD40D4934794888C073313B36CF03CF1F739F39443551FF12BBEA09A6970490B6842D223465AD201E0D51ADF93FFBC7639947679081897168E63CCA0D3B5C496169AE4BF020007192C85041AD9A67DFEF848CB0BF0122B049E01A563A037677206C85D7BF905A2F29D9380C65C8D6F7231B1C5A36CB628BC5CCC0FE4D0B90100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000103841908B1008263088464343A48B8B302F8B004F8ADE3A02C4265C60FAA7BE948C2BCF897528B5BE49EE255DC63A59AC485A27A791CE4550302F886B8413418A10D28A161F27C012288E8894BA59EA03BE35A31AB0773A208D504FE67716BEB8849E3F527E1E489FE5DD28D3B244A9EF61F97D4727A66FEC5B709DF201A01B84166975E377B835A5B5D6997B89595381DF74B908B36DBA755E79CAD2FA805A93E3B45D7C4675139C639845357E80064B56E5FB6BBB9C286C42A6D275A9EC034990180A00000000000000000000000000000000000000000000000000000000000000000880000000000000000B841C19275F72B8DD15D614BAE2FDF603CD04263529D8B1E52B383E048FE3BD0764B22247DE4CEE6FF17443F30F8B39C48E6DEEB21AA700AD4CE99080A868FE8C77B01C0C080";
    const block4_encoded = "0xF902F1A0F8F6162FEEB3FA8F342290FFF81B32938EAD25AB6608223682D1A90E5881B668A01DCC4DE8DEC75D7AAB85B567B6CCD41AD312451B948A7413F0A142FD40D4934794EFEA93E384A6CCAAF28E33790A2D1B2625BF964DA05D27C238EA941962FBAE8974C064146D1B9E2B1DF189A1A5038D101054A581C6A0755A640BF250BDD7FE0FE3DDE16569E56F17AFF37CE52E03F493A9DA588FF7EFA037677206C85D7BF905A2F29D9380C65C8D6F7231B1C5A36CB628BC5CCC0FE4D0B90100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000104841908B1008263088464343A4AB8B302F8B005F8ADE3A0F8F6162FEEB3FA8F342290FFF81B32938EAD25AB6608223682D1A90E5881B6680403F886B841CD65FBFDBEF1373B85CD62A8E97412D173104ABA8EDDCDD9413C125F1315EA053B3B633288151CC8D5BE101268266318716A9E39B799971936224F324911E56801B8418C1E645BC3C03DA137F68B74FCE11A32D23B26A70136F6E1E829FE6D8898CF5A52B0AFD6BD3FF0DCA23BB979308E02D02C5E442DA3E7DB7E52680BB965AB71F10080A00000000000000000000000000000000000000000000000000000000000000000880000000000000000B8414506585025C5AD2F3905CEC1BD44A0A8B553B806C9C5B5F2BD0B77012321B76C5BFBD02B48042B2A7E89A02F8AB07557C21219E27AD09D4128F770FE9E4CECBA00C0C080";
    const block5_encoded = "0xF902F1A0ECBE2A59B9F98CFFB8249062854DC9F91A0D18F5844F05EC4655C9B6833A20EEA01DCC4DE8DEC75D7AAB85B567B6CCD41AD312451B948A7413F0A142FD40D49347945058DFE24EF6B537B5BC47116A45F0428DA182FAA00D367D01088BACDFF4E89CF617B576681FED320D55BEC0DDB1F624CA74F2AE92A00420D46D8071F44EF9DF21DCE6FFC89E2A82DB14FD35AF4C0763B96DDEA8B9BCA037677206C85D7BF905A2F29D9380C65C8D6F7231B1C5A36CB628BC5CCC0FE4D0B90100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000105841908B1008263088464343A4DB8B302F8B006F8ADE3A0ECBE2A59B9F98CFFB8249062854DC9F91A0D18F5844F05EC4655C9B6833A20EE0504F886B8417F38B57235DDFD8F37F4A330D29EE0F771B9219A0177343C8653632D854BA3424808E796E83BB344A18E7DA2E595002552FBAFF2CFC65FA9E8808B545E210D3C00B8412B5DDE3D67613CADBDD1904A6D3E30106E663DBF686F89576FC75D13968397414AF28CB18CA2A020EE1F31FEFE77521BB80383499E7841161AC6E25FA7ACC4DD0180A00000000000000000000000000000000000000000000000000000000000000000880000000000000000B8415EE0ED5D0D2B6E3A300265E3E33F813DEC4DD6414996AE4C38F8C279446A18C24D1651B7FD02E2F94EF866497285D70D0B710F30238CB2AB1E22EDB5D9F1F9F201C0C080";
    const block5_hash = web3.utils.sha3(Buffer.from(hex2Arr(block5_encoded.slice(2)))).toString("hex");

    await this.subnet.receiveHeader([block2_encoded, block3_encoded]);
    await this.subnet.receiveHeader([block4_encoded, block5_encoded]);

    const block2_resp = await this.subnet.getHeader(block2_hash);
    const latest_blocks = await this.subnet.getLatestBlocks();
    assert.equal(block2_resp[4], true);
    assert.equal(latest_blocks["0"][0], block5_hash);
    assert.equal(latest_blocks["1"][0], block2_hash);

  });


});