import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Team, User } from '@/lib/models';
import bcrypt from 'bcryptjs';

// Helper function to generate player data
function generatePlayerData(teamName, teamIndex, playerNumber, isCaptain = false) {
  const firstNames = [
    'Ana', 'Beatriz', 'Carla', 'Daniela', 'Elena', 'Fernanda', 'Gabriela', 'Helena',
    'Isabela', 'Julia', 'Karina', 'Larissa', 'Mariana', 'Natália', 'Olivia', 'Patricia',
    'Rafaela', 'Sofia', 'Tatiana', 'Vanessa', 'Wendy', 'Yasmin', 'Zara', 'Amanda',
    'Bianca', 'Camila', 'Diana', 'Elisa', 'Fabiana', 'Giovanna', 'Hanna', 'Iris'
  ];
  
  const lastNames = [
    'Silva', 'Santos', 'Oliveira', 'Costa', 'Ferreira', 'Alves', 'Lima', 'Martins',
    'Souza', 'Rodrigues', 'Pereira', 'Carvalho', 'Araújo', 'Ribeiro', 'Gomes', 'Reis',
    'Mendes', 'Barbosa', 'Nunes', 'Monteiro', 'Dias', 'Rocha', 'Cavalcanti', 'Freitas'
  ];

  const positions = [
    'Goleira', 'Zagueira', 'Zagueira', 'Lateral Direita', 'Lateral Esquerda',
    'Volante', 'Volante', 'Meio-campo', 'Meio-campo', 'Ponta Direita',
    'Ponta Esquerda', 'Atacante', 'Atacante', 'Meia-atacante', 'Zagueira'
  ];

  const pernasDominantes = ['Direita', 'Esquerda'];

  // For captain, use specific data based on teamIndex
  if (isCaptain) {
    const captainData = [
      { nomeCompleto: "Ana Silva", email: "ana.silva@passabola.com", numeroCamisa: 10, posicao: "Atacante" },
      { nomeCompleto: "Beatriz Santos", email: "beatriz.santos@passabola.com", numeroCamisa: 7, posicao: "Meio-campo" },
      { nomeCompleto: "Carla Oliveira", email: "carla.oliveira@passabola.com", numeroCamisa: 9, posicao: "Atacante" },
      { nomeCompleto: "Daniela Costa", email: "daniela.costa@passabola.com", numeroCamisa: 8, posicao: "Volante" },
      { nomeCompleto: "Elena Ferreira", email: "elena.ferreira@passabola.com", numeroCamisa: 11, posicao: "Ponta" },
      { nomeCompleto: "Fernanda Alves", email: "fernanda.alves@passabola.com", numeroCamisa: 6, posicao: "Zagueira" },
      { nomeCompleto: "Gabriela Lima", email: "gabriela.lima@passabola.com", numeroCamisa: 5, posicao: "Zagueira" },
      { nomeCompleto: "Helena Martins", email: "helena.martins@passabola.com", numeroCamisa: 1, posicao: "Goleira" }
    ];
    return captainData[teamIndex];
  }

  // Generate random player data
  const firstName = firstNames[(teamIndex * 15 + playerNumber) % firstNames.length];
  const lastName = lastNames[(teamIndex * 15 + playerNumber) % lastNames.length];
  const nomeCompleto = `${firstName} ${lastName}`;
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.t${teamIndex + 1}.p${playerNumber}@passabola.com`;
  
  return {
    nomeCompleto,
    email,
    numeroCamisa: playerNumber === 1 ? 1 : (playerNumber <= 11 ? playerNumber : playerNumber + 1),
    posicao: positions[playerNumber - 1] || positions[playerNumber % positions.length],
    pernaDominante: pernasDominantes[playerNumber % 2]
  };
}

// POST - Seed 8 teams with 15 players each
export async function POST(request) {
  try {
    await connectDB();

    // Check if teams already exist
    const existingTeams = await Team.countDocuments();
    if (existingTeams > 0) {
      return NextResponse.json(
        { error: 'Times já existem no banco de dados. Use DELETE /api/teams/delete-all para limpar antes de popular novamente.' },
        { status: 400 }
      );
    }

    // Team data
    const teamData = [
      {
        nome: "Time Estrelas",
        descricao: "Time formado por estrelas do futebol feminino, sempre em busca da vitória!",
        cor1: "#FF6B6B",
        cor2: "#4ECDC4",
        imagem: "/time-feminino.png"
      },
      {
        nome: "Time Fênix",
        descricao: "Como a fênix, sempre renascemos mais fortes!",
        cor1: "#9B59B6",
        cor2: "#E74C3C",
        imagem: "/time-feminino.png"
      },
      {
        nome: "Time Dragões",
        descricao: "Vamos dominar o campo com nossa força e determinação!",
        cor1: "#E67E22",
        cor2: "#F39C12",
        imagem: "/time-feminino.png"
      },
      {
        nome: "Time Leões",
        descricao: "Coragem e lealdade são nossos valores principais!",
        cor1: "#3498DB",
        cor2: "#2ECC71",
        imagem: "/time-feminino.png"
      },
      {
        nome: "Time Águias",
        descricao: "Voando alto em busca da glória!",
        cor1: "#1ABC9C",
        cor2: "#16A085",
        imagem: "/time-feminino.png"
      },
      {
        nome: "Time Panteras",
        descricao: "Ágeis, rápidas e sempre prontas para o ataque!",
        cor1: "#34495E",
        cor2: "#ECF0F1",
        imagem: "/time-feminino.png"
      },
      {
        nome: "Time Lobas",
        descricao: "Unidade e força são nossa essência!",
        cor1: "#E74C3C",
        cor2: "#C0392B",
        imagem: "/time-feminino.png"
      },
      {
        nome: "Time Tigresas",
        descricao: "Ferozes e determinadas, nunca desistimos!",
        cor1: "#F39C12",
        cor2: "#D35400",
        imagem: "/time-feminino.png"
      }
    ];

    const createdTeams = [];
    const createdUsers = [];
    let totalUsersCreated = 0;
    let totalTeamsCreated = 0;

    // Hash password for all users
    const hashedPassword = await bcrypt.hash('123456', 10);

    // Create teams with 15 players each
    for (let teamIndex = 0; teamIndex < teamData.length; teamIndex++) {
      const teamInfo = teamData[teamIndex];
      
      try {
        // Generate captain data
        const captainData = generatePlayerData(teamInfo.nome, teamIndex, 1, true);
        
        // Check if captain user already exists
        let captain = await User.findOne({ email: captainData.email });
        
        if (!captain) {
          // Create captain user
          captain = new User({
            nomeCompleto: captainData.nomeCompleto,
            email: captainData.email,
            telefone: `1198765432${teamIndex + 1}`,
            dataNascimento: `${1995 + teamIndex}-05-15`,
            nomeCamisa: captainData.nomeCompleto.split(' ')[0],
            numeroCamisa: captainData.numeroCamisa,
            altura: 160 + (teamIndex * 2),
            peso: 55 + teamIndex,
            posicao: captainData.posicao,
            pernaDominante: captainData.pernaDominante || 'Direita',
            senha: hashedPassword
          });
          await captain.save();
          createdUsers.push(captain);
          totalUsersCreated++;
        }

        // Create team
        const team = new Team({
          nome: teamInfo.nome,
          descricao: teamInfo.descricao,
          cor1: teamInfo.cor1,
          cor2: teamInfo.cor2,
          imagem: teamInfo.imagem,
          captainId: captain._id
        });

        // Add captain as first team member
        team.members.push({
          userId: captain._id,
          position: captain.posicao,
          jerseyNumber: captain.numeroCamisa
        });

        // Create and add 14 additional players
        for (let playerNum = 2; playerNum <= 15; playerNum++) {
          const playerData = generatePlayerData(teamInfo.nome, teamIndex, playerNum, false);
          
          // Check if player already exists
          let player = await User.findOne({ email: playerData.email });
          
          if (!player) {
            // Create player user
            player = new User({
              nomeCompleto: playerData.nomeCompleto,
              email: playerData.email,
              telefone: `119876543${teamIndex + 1}${playerNum.toString().padStart(1, '0')}`,
              dataNascimento: `${1995 + (playerNum % 5)}-${(playerNum % 12) + 1}-${(playerNum % 28) + 1}`,
              nomeCamisa: playerData.nomeCompleto.split(' ')[0],
              numeroCamisa: playerData.numeroCamisa,
              altura: 155 + (playerNum % 15),
              peso: 50 + (playerNum % 15),
              posicao: playerData.posicao,
              pernaDominante: playerData.pernaDominante,
              senha: hashedPassword
            });
            await player.save();
            createdUsers.push(player);
            totalUsersCreated++;
          }

          // Add player to team
          team.members.push({
            userId: player._id,
            position: player.posicao,
            jerseyNumber: player.numeroCamisa
          });

          // Update player's teamId
          player.teamId = team._id;
          await player.save();
        }

        await team.save();

        // Update captain's team info
        captain.teamId = team._id;
        captain.isTeamCaptain = true;
        await captain.save();

        totalTeamsCreated++;
        createdTeams.push({
          id: team._id.toString(),
          nome: team.nome,
          captainName: captain.nomeCompleto,
          memberCount: team.members.length
        });

        console.log(`✓ Created team: ${teamInfo.nome} with ${team.members.length} players`);

      } catch (error) {
        console.error(`Error creating team ${teamInfo.nome}:`, error);
        // Continue with next team even if one fails
      }
    }

    return NextResponse.json({
      success: true,
      message: `${totalTeamsCreated} times foram criados com sucesso, cada um com 15 jogadoras!`,
      teams: createdTeams,
      totalUsers: totalUsersCreated,
      totalTeams: totalTeamsCreated,
      note: "Senha padrão para todos os usuários: 123456"
    }, { status: 201 });

  } catch (error) {
    console.error('Seed teams error:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Alguns times ou usuários já existem no banco de dados' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erro ao popular times', details: error.message },
      { status: 500 }
    );
  }
}
